// Turns a visitor's free description ("un mariage le 12 décembre à Cocody") into the fields of the
// guided request. The model only proposes; every value is checked against the visitor's own words.

export const SERVICES = ["photo", "video", "design", "web"];

const SYNONYMS = {
  photo: /\b(photos?|photograph\w*|shooting|portraits?|séance|seance|pictures?)\b/i,
  video: /\b(vid[ée]os?|films?|clips?|reportages?|tournage|filmer|footage)\b/i,
  design: /\b(design|graphi\w*|affiches?|flyers?|logos?|visuels?|infographi\w*|posters?|identité|identity|canva)\b/i,
  web: /\b(sites?|web\w*|portfolio|landing|refonte|site internet|website)\b/i,
};

const EMPTY = /^(?:null|none|n\/a|na|unknown|inconnu|inconnue|non précisé|non precise|not specified|—|-|\?)$/i;
const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Service guessed from the visitor's words alone, when the model gives nothing usable. */
export function guessService(text) {
  const hits = SERVICES.filter((k) => SYNONYMS[k].test(text));
  return hits.length === 1 ? hits[0] : undefined;
}

function serviceKey(value, text) {
  const v = typeof value === "string" ? fold(value) : "";
  if (SERVICES.includes(v)) return v;
  for (const k of SERVICES) if (SYNONYMS[k].test(v)) return k;
  return guessService(text);
}

function clean(value, max) {
  if (typeof value !== "string") return undefined;
  const v = value.replace(/\s+/g, " ").trim().slice(0, max);
  return v && !EMPTY.test(v) ? v : undefined;
}

// A name, place or date the model "found" must really come from the visitor's text
function grounded(value, text) {
  const hay = fold(text);
  const words = fold(value).split(/[^a-z0-9]+/).filter((w) => w.length >= 3);
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

/** Safe fields for the form, from the model's object (may be null) and the visitor's text. */
export function normalizeBrief(obj, text) {
  const o = obj ?? {};
  const brief = {};
  const service = serviceKey(o.service, text);
  if (service) brief.service = service;
  const kind = clean(o.kind, 60);
  if (kind) brief.kind = kind;
  for (const key of ["date", "place", "name"]) {
    const v = clean(o[key], 80);
    if (v && grounded(v, text)) brief[key] = v;
  }
  const details = clean(o.details, 200);
  if (details && grounded(details, text)) brief.details = details;
  return brief;
}

export const BRIEF_SYSTEM = `You extract a service request for EGC Studio (photo, video, graphic design, websites) from a visitor's message.
Answer with ONE JSON object and nothing else, with exactly these keys:
{"service": "photo" | "video" | "design" | "web" | null, "kind": string | null, "date": string | null, "place": string | null, "details": string | null, "name": string | null}
- Copy words from the visitor's message; never invent. Use null when the message does not say.
- "kind" is the type of project in 1 to 4 words (for example Mariage, Portrait, Affiche, Site vitrine), in the visitor's language.
- "date" and "place" are written as the visitor wrote them. "details" is a short summary of anything else useful (guests, duration, style).
- "name" is only the visitor's own first name or full name if they gave it.`;
