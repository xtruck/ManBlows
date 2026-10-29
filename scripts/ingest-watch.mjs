// Watches the owner's folder for new photos and videos and prepares web-ready copies.
//
//   node scripts/ingest-watch.mjs            keep watching (poll every 15 s)
//   node scripts/ingest-watch.mjs --once     scan once and exit
//   node scripts/ingest-watch.mjs --dir <folder> --out <folder> --interval 10
//
// Converted files go to inbox/ready/ (NOT public/), so nothing is published by accident.
// inbox/queue.json lists what is waiting to be captioned and added to the site.
// The files already in the folder when the watcher first runs are treated as done.

import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const watchDir = opt("dir", "D:/OneDrive/Desktop/MAN BLOWS");
const outDir = path.resolve(opt("out", path.join(root, "inbox")));
const interval = Number(opt("interval", 15)) * 1000;
const once = args.includes("--once");
const readyDir = path.join(outDir, "ready");
const statePath = path.join(outDir, "state.json");
const queuePath = path.join(outDir, "queue.json");
const logPath = path.join(outDir, "ingest.log");

const IMAGE = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".avif", ".tif", ".tiff"]);
const VIDEO = new Set([".mp4", ".mov", ".m4v", ".avi", ".mkv", ".webm"]);
const MAX_ATTEMPTS = 3;

fs.mkdirSync(readyDir, { recursive: true });
const readJson = (p, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
};
const writeJson = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2));
const log = (msg) => {
  const line = `${new Date().toISOString()}  ${msg}`;
  console.log(line);
  fs.appendFileSync(logPath, line + "\n");
};

const firstRun = !fs.existsSync(statePath);
const state = readJson(statePath, { files: {} }); // key -> { status, attempts }
const queue = readJson(queuePath, []);
const lastSeen = new Map(); // key -> "size:mtime" from the previous poll, to wait until a file stops changing

const keyOf = (name, st) => `${name}|${st.size}|${Math.round(st.mtimeMs)}`;
const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 40) || "file";

async function convertImage(src, base) {
  const out = path.join(readyDir, `${base}.webp`);
  const meta = await sharp(src).metadata();
  const info = await sharp(src)
    .rotate()
    .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: meta.hasAlpha ? 85 : 82 })
    .toFile(out);
  return { type: "image", out: path.relative(root, out).replace(/\\/g, "/"), w: info.width, h: info.height, kb: Math.round(info.size / 1024) };
}

async function convertVideo(src, base) {
  const out = path.join(readyDir, `${base}.mp4`);
  const poster = path.join(readyDir, `${base}-poster.webp`);
  // Phone videos can be 4K/HEVC; scale down to 720p-ish H.264 so they play everywhere.
  try {
    await run(
      "ffmpeg",
      ["-y", "-loglevel", "error", "-i", src, "-vf", "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))'", "-c:v", "libx264", "-preset", "veryfast", "-crf", "27", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "128k", out],
      { maxBuffer: 1 << 26, timeout: 30 * 60 * 1000 },
    );
  } catch (e) {
    fs.rmSync(out, { force: true }); // never leave a half-written file behind
    throw new Error(String(e.stderr || e.message).trim().split("\n").slice(-4).join(" | "));
  }
  const tmp = path.join(readyDir, `${base}-poster.jpg`);
  await run("ffmpeg", ["-y", "-ss", "1", "-i", out, "-frames:v", "1", tmp], { timeout: 60000 }).catch(() =>
    run("ffmpeg", ["-y", "-i", out, "-frames:v", "1", tmp], { timeout: 60000 }),
  );
  await sharp(tmp).resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 80 }).toFile(poster);
  fs.rmSync(tmp, { force: true });
  const meta = await sharp(poster).metadata();
  return {
    type: "video",
    out: path.relative(root, out).replace(/\\/g, "/"),
    poster: path.relative(root, poster).replace(/\\/g, "/"),
    w: meta.width,
    h: meta.height,
    kb: Math.round(fs.statSync(out).size / 1024),
  };
}

async function scan() {
  let names;
  try {
    names = fs.readdirSync(watchDir);
  } catch (e) {
    log(`cannot read ${watchDir}: ${e.message}`);
    return;
  }
  for (const name of names) {
    const ext = path.extname(name).toLowerCase();
    // "IMG_0139.JPG.jpeg" style names: the last extension decides
    const kind = IMAGE.has(ext) ? "image" : VIDEO.has(ext) ? "video" : null;
    if (!kind) continue;
    const src = path.join(watchDir, name);
    let st;
    try {
      st = fs.statSync(src);
    } catch {
      continue;
    }
    if (!st.isFile()) continue;
    const key = keyOf(name, st);
    const entry = state.files[key];
    if (entry && (entry.status === "done" || entry.status === "baseline" || entry.attempts >= MAX_ATTEMPTS)) continue;

    if (firstRun && !entry) {
      state.files[key] = { status: "baseline", attempts: 0 };
      continue;
    }

    // Wait until the file has stopped growing (OneDrive sync, copy in progress).
    const sig = `${st.size}:${Math.round(st.mtimeMs)}`;
    if (lastSeen.get(key) !== sig) {
      lastSeen.set(key, sig);
      if (!once) continue;
    }

    const base = `${slug(path.parse(name).name)}-${createHash("sha1").update(key).digest("hex").slice(0, 6)}`;
    try {
      log(`converting ${kind}: ${name}`);
      const res = kind === "image" ? await convertImage(src, base) : await convertVideo(src, base);
      queue.push({ id: base, source: name, status: "new", addedAt: new Date().toISOString(), ...res });
      state.files[key] = { status: "done", attempts: (entry?.attempts ?? 0) + 1 };
      log(`ready: ${res.out} (${res.w}x${res.h}, ${res.kb} KB)`);
    } catch (e) {
      const attempts = (entry?.attempts ?? 0) + 1;
      state.files[key] = { status: "failed", attempts };
      log(`FAILED ${name} (attempt ${attempts}/${MAX_ATTEMPTS}): ${String(e.message).split("\n")[0]}`);
    }
    writeJson(statePath, state);
    writeJson(queuePath, queue);
  }
  writeJson(statePath, state);
  writeJson(queuePath, queue);
}

log(`watching ${watchDir}${firstRun ? " (first run: existing files are treated as already done)" : ""}`);
await scan();
if (once) process.exit(0);
// One scan at a time: a long video conversion must finish before the next poll starts,
// otherwise two conversions write to the same output file and both fail.
const loop = async () => {
  try {
    await scan();
  } catch (e) {
    log(`scan error: ${e.message}`);
  }
  setTimeout(loop, interval);
};
setTimeout(loop, interval);
