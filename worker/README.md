# EGC assistant Worker (Cloudflare Workers AI)

The AI behind the site's assistant. The guided request (service, date, place… then WhatsApp)
works without it; with it, visitors can also:

- **Ask free questions**, answered word by word from the studio's real information
  (`knowledge.generated.mjs`, built from the site's own texts).
- **Describe their project in one sentence**: the AI fills in the service, type, date, place,
  details and name it finds, and the assistant only asks for what is missing. Anything the visitor
  did not say is dropped (`brief.mjs`), so nothing is invented.

## Rules, enforced in code

The prompt tells the model never to talk about money, dates, availability or travel zones (Egu
gives them in his quote). `guard.mjs` then checks **every** reply, whatever the model wrote, and
swaps in a safe answer if it contains a price or amount, "free"/discount wording, a phone number,
e-mail or link that is not the studio's own, or a leak of the prompt. While streaming, text is
held back a few characters and the final checked text replaces what was shown.

## Deploy (once, from your own computer)

```bash
cd worker
npx wrangler login      # opens Cloudflare in the browser
npx wrangler deploy     # prints https://egc-assistant.<your-account>.workers.dev
```

Then give that URL to the site build: GitHub, repository **Settings → Secrets and variables →
Actions → Variables → New repository variable**, name `ASSISTANT_URL`, value the Worker URL.
Re-run the "Deploy to GitHub Pages" workflow. Without this variable the assistant keeps its
guided flow only.

## After each change

| When | Do |
| --- | --- |
| You edit the site's FAQ, services, process or contact details | `npm run knowledge` (rebuilds `knowledge.generated.mjs`; `-- --check` tells you if it is out of date), then `npx wrangler deploy` |
| You change the Worker, the prompt or the model | `npm run test:worker` (no account needed), `npx wrangler deploy`, then the check below |

## Check the real AI

```bash
node worker/eval.mjs https://egc-assistant.<your-account>.workers.dev --show
```

Sends 20 questions built to trip it up (price traps, "ignore your rules", off-topic, wrong
language, contact requests) and exits with an error if any reply breaks a rule. It waits between
questions because of the rate limit. Read the replies too: the script checks rules, not charm.

## Notes

- `MODEL` (in `wrangler.jsonc`) is a Workers AI chat model id. Check it against Cloudflare's model
  list before deploying, and switch to a newer small instruct model if it was retired.
- Workers AI has a free daily allowance (each question sends about 1,500 tokens of knowledge);
  past it, requests fail and the site points visitors to WhatsApp. For a hard cap per visitor, add
  a Cloudflare rate-limiting rule on the Worker (the built-in limit is 12 requests a minute per
  visitor, per Worker instance).
- Only the origins in `ALLOWED_ORIGINS` can call it. Nothing is stored or logged by the Worker.
- Edit `SYSTEM`/`systemPrompt` in `index.mjs` to change the tone or the rules; the guard in
  `guard.mjs` is the safety net and has its own tests.
