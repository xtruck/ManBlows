// Turns a visitor's free description ("photos et film de mon mariage le 12 décembre à Cocody") into
// the fields of the guided request: one or several services, the shared facts (type, date, place,
// guests, name) and a few details per service. The model only proposes; every value is checked
// against the visitor's own words, and a detail is kept only for a service the request includes.

export const SERVICES = ["photo", "video", "design", "web"];

// The details each service may carry, as the guided flow asks them (client: components/Assistant.tsx)
export const SERVICE_FIELDS = {
  photo: ["cover"],
  video: ["type", "length"],
  design: ["items"],
  web: ["type", "pages"],
};

const SYNONYMS = {
  photo: /\b(photos?|photograph\w*|shooting|portraits?|séance|seance|pictures?)\b/i,
  video: /\b(vid[ée]os?|films?|clips?|reportages?|tournage|filmer|footage|reels?|drone)\b/i,
  design: /\b(design|graphi\w*|affiches?|flyers?|logos?|visuels?|infographi\w*|posters?|identité|identity|canva|kak[ée]monos?|banni[èe]res?|banners?)\b/i,
  web: /\b(sites?|web\w*|portfolio|landing|refonte|site internet|website|e-?commerce|boutique en ligne)\b/i,
};

const EMPTY = /^(?:null|none|n\/a|na|unknown|inconnu|inconnue|non précisé|non precise|not specified|—|-|\?)$/i;
const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Every service named in the visitor's words alone: the fallback when the model gives nothing usable. */
export function guessServices(text) {
  return SERVICES.filter((k) => SYNONYMS[k].test(text));
}

function serviceKey(value) {
  const v = typeof value === "string" ? fold(value).trim() : "";
  if (!v) return undefined;
  if (SERVICES.includes(v)) return v;
  return SERVICES.find((k) => SYNONYMS[k].test(v));
}

// The model may answer a list, a single string or the older "service" key; the keywords are the fallback
function serviceList(o, text) {
  const raw = [o.services, o.service].flat().filter((x) => x != null);
  const fromModel = new Set(raw.map(serviceKey).filter(Boolean));
  if (fromModel.size > 0) return SERVICES.filter((k) => fromModel.has(k));
  return guessServices(text);
}

function clean(value, max) {
  if (Array.isArray(value)) value = value.filter((x) => typeof x === "string").join(", ");
  if (typeof value !== "string") return undefined;
  const v = value.replace(/\s+/g, " ").trim().slice(0, max);
  return v && !EMPTY.test(v) ? v : undefined;
}

// A value the model "found" must really come from the visitor's text (numbers count, however short)
function grounded(value, text) {
  const hay = fold(text);
  const words = fold(value).split(/[^a-z0-9]+/).filter((w) => w.length >= 3 || /^\d+$/.test(w));
  return words.length > 0 && words.some((w) => hay.includes(w));
}

/** Extracts the first JSON object from a model answer, tolerating text or code fences around it. */
export function parseJsonObject(raw) {
  if (typeof raw !== "string") return null;
  const a = raw.indexOf("{");
  const b = raw.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  try {
    const o = JSON.parse(raw.slice(a, b + 1));
    return o && typeof o === "object" && !Array.isArray(o) ? o : null;
  } catch {
    return null;
  }
}

/**
 * Safe fields for the form, from the model's object (may be null) and the visitor's text:
 * { services?: [...], kind?, date?, place?, guests?, name?, details?,
 *   photo?: { cover? }, video?: { type?, length? }, design?: { items? }, web?: { type?, pages? } }.
 * A service's details are kept only when that service is in "services".
 */
export function normalizeBrief(obj, text) {
  const o = obj ?? {};
  const brief = {};
  const services = serviceList(o, text);
  if (services.length > 0) brief.services = services;
  const kind = clean(o.kind, 60);
  if (kind) brief.kind = kind;
  for (const key of ["date", "place", "guests", "name"]) {
    const v = clean(o[key], 80);
    if (v && grounded(v, text)) brief[key] = v;
  }
  const details = clean(o.details, 200);
  if (details && grounded(details, text)) brief.details = details;
  for (const s of services) {
    const src = o[s] && typeof o[s] === "object" && !Array.isArray(o[s]) ? o[s] : {};
    const out = {};
    for (const f of SERVICE_FIELDS[s]) {
      const v = clean(src[f], 120);
      if (v && grounded(v, text)) out[f] = v;
    }
    if (Object.keys(out).length > 0) brief[s] = out;
  }
  return brief;
}

export const BRIEF_SYSTEM = `You extract a service request for EGC Studio (photo, video, graphic design, websites) from a visitor's message.
A visitor may want SEVERAL services for the same project (for example photo + video + graphic design for a wedding).
Answer with ONE JSON object and nothing else, with exactly these keys:
{"services": ["photo" | "video" | "design" | "web", ...], "kind": string | null, "date": string | null, "place": string | null, "guests": string | null, "name": string | null, "details": string | null,
 "photo": {"cover": string | null}, "video": {"type": string | null, "length": string | null}, "design": {"items": string | null}, "web": {"type": string | null, "pages": string | null}}
- "services" lists EVERY service the visitor asks for, and only those ([] when none is clear).
- Copy words from the visitor's message; never invent. Use null when the message does not say.
- "kind" is the type of project or occasion in 1 to 4 words (for example Mariage, Anniversaire, Événement d'entreprise, Site vitrine), in the visitor's language.
- "date" and "place" are written as the visitor wrote them. "guests" is the number of people or guests, if given.
- "photo.cover": what the photos must cover (ceremony, reception, portraits, products).
- "video.type": full film, highlight clip, reels, drone. "video.length": the length wanted.
- "design.items": the supports wanted (flyer, poster, logo, social media posts, banner, invitation), with quantities if given.
- "web.type": the kind of website (business site, online shop, booking, portfolio). "web.pages": pages or features wanted, or the address of the current site.
- "details" is a short summary of anything else useful that fits nowhere above.
- "name" is only the visitor's own first name or full name if they gave it.
- Never mention prices, budget or money.`;
