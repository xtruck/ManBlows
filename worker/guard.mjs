// Rules enforced in code on every AI reply, whatever the model says. Egu sets money, dates and
// travel zones himself in his quote, and nobody should see an invented contact or a leaked prompt.

import { CONTACT } from "./knowledge.generated.mjs";

const MONEY = [
  /\d[\d\s.,]*\s*(?:f\s?cfa|fcfa|cfa|xof|xaf|€|eur\b|euros?|\$|usd\b|dollars?)/i,
  /(?:€|\$)\s*\d/,
  /\b(?:fcfa|xof|xaf)\b/i,
  /\b(?:prix|tarifs?|coûte|coute|coûtent|costs?|prices?|priced)\b[^.\n]{0,40}\d/i,
  /\b(?:gratuit|gratuite|gratuits|gratuitement|free of charge|remise|discount|promo|promotion)\b/i,
];
const LEAK = /(?:^|\n)\s*(?:###\s*(?:KNOWLEDGE|RULES)|Rules:)|NEVER give|ignore (?:all |the )?previous instructions/i;

const digits = (s) => s.replace(/\D/g, "");
const official = digits(CONTACT.whatsapp);

function badPhone(text) {
  for (const m of text.match(/\+?\d[\d\s().-]{7,}\d/g) ?? []) {
    const d = digits(m);
    if (d.length >= 8 && !(official.includes(d) || d.includes(official.slice(-10)))) return true;
  }
  return false;
}
function badEmail(text) {
  return (text.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) ?? []).some((e) => e.toLowerCase() !== CONTACT.email.toLowerCase());
}
const URL_OK = [/^https?:\/\/xtruck\.github\.io(?:\/|$)/i, new RegExp(`^https?://wa\\.me/${official}`, "i"), new RegExp(`^https?://(?:www\\.)?instagram\\.com/${CONTACT.instagram}`, "i"), new RegExp(`^https?://(?:www\\.)?tiktok\\.com/@${CONTACT.tiktok}`, "i")];
function badUrl(text) {
  return (text.match(/(?:https?:\/\/|www\.)[^\s)]+/gi) ?? []).some((u) => !URL_OK.some((re) => re.test(u.replace(/^www\./i, "https://"))));
}

/** Why a reply must not be shown (empty array if it is fine). */
export function violations(text) {
  const out = [];
  if (MONEY.some((re) => re.test(text))) out.push("money");
  if (badPhone(text)) out.push("phone");
  if (badEmail(text)) out.push("email");
  if (badUrl(text)) out.push("url");
  if (LEAK.test(text)) out.push("leak");
  return out;
}

/** The answer given instead of a reply that broke a rule, or when the AI has nothing safe to say. */
export function safeReply(lang) {
  return lang === "en"
    ? "Egu confirms prices, dates and availability himself in his quote, within 24 hours. You can start a request here or message him on WhatsApp."
    : "Egu confirme lui-même les prix, les dates et les disponibilités dans son devis, sous 24 heures. Vous pouvez faire une demande ici ou lui écrire sur WhatsApp.";
}

/** Plain text for a chat bubble: no markdown, at most ~700 characters, cut at a sentence. */
export function tidy(text) {
  let t = text
    .replace(/\r/g, "")
    .replace(/\*\*|__|`/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (t.length > 700) {
    const cut = t.slice(0, 700);
    const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "), cut.lastIndexOf("\n"));
    t = end > 200 ? cut.slice(0, end + 1) : `${cut.trimEnd()}…`;
  }
  return t;
}

/** Final text for a visitor: tidied, or the safe reply if a rule was broken. */
export function finalize(text, lang) {
  const t = tidy(text);
  if (!t) return { text: safeReply(lang), flagged: ["empty"] };
  const v = violations(t);
  return v.length ? { text: safeReply(lang), flagged: v } : { text: t, flagged: [] };
}
