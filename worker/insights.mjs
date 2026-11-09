// What visitors ask, without storing what they write. Each request leaves one JSON line in the
// Worker's logs (Cloudflare "Workers Logs") with a coarse topic and the outcome: never the
// question, the answer, the visitor's name, IP address or browser. Enough to see that "prices" or
// "travel" keep coming up and the FAQ needs an answer, nothing that identifies anyone.

const TOPICS = [
  ["attack", /ignore (all|your|the|toutes|tes|vos|previous)|instructions? precedentes|system prompt|prompt systeme|you are now|jailbreak|mot pour mot|### ?knowledge/],
  ["money", /\b(prix|tarifs?|combien|cout\w*|cher|budget|remise|reduction|gratuit\w*|price\w*|how much|cost\w*|cheap|discount|fcfa)\b/],
  ["schedule", /\b(disponib\w*|libre|delais?|livraison|livrez|quand|jours?|semaines?|availab\w*|deadline|turnaround|delivery|how long|when)\b/],
  ["travel", /\b(deplac\w*|transport|zones?|bouake|yamoussoukro|san.?pedro|travel\w*|abroad|etranger|hors d'?abidjan)\b/],
  ["contact", /\b(numero|whatsapp|e-?mail|mail|telephone|phone|instagram|tiktok|adresse|address|contacter|contact)\b/],
  ["web", /\b(sites?|website|portfolio|seo|google|domaine|domain|refonte|landing)\b/],
  ["video", /\b(videos?|films?|clips?|reportages?|tournage|filmer|drone)\b/],
  ["photo", /\b(photos?|photograph\w*|shooting|portraits?|seance|mariage|bapteme)\b/],
  ["design", /\b(design|graphi\w*|affiches?|flyers?|logos?|visuels?|infographi\w*|canva|identite)\b/],
  ["process", /\b(comment|how does|how do|collaboration|etapes?|steps?|process|commencer|start)\b/],
  ["about", /\b(qui est|who is|egu|studio|abidjan|equipe|team|experience)\b/],
];

const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** A coarse topic for a question (the first matching rule; "other" if none). */
export function topicOf(text) {
  const t = fold(String(text ?? ""));
  for (const [topic, re] of TOPICS) if (re.test(t)) return topic;
  return "other";
}

/** One anonymous line in the logs. Only the fields below are ever written. */
export function record(event, { lang, topic, outcome, flagged, streamed, ms, found, ai } = {}) {
  try {
    console.log(JSON.stringify({ app: "egc-assistant", event, lang, topic, outcome, flagged: flagged?.length ? flagged : undefined, streamed, ms, found, ai }));
  } catch {
    // logging must never break an answer
  }
}
