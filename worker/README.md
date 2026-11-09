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

## Limits and the free allowance

- **Hard limit per visitor**: Cloudflare's own rate limiter (`LIMITER` in `wrangler.jsonc`): 12 requests a
  minute per visitor, enforced for everyone however many Worker copies are running. If the binding is ever
  missing, a weaker in-memory limit takes over.
- **Daily cap on AI answers** (optional, recommended): once the day's budget (`DAILY_BUDGET`, 500 by default) is
  spent, the Worker stops calling the AI until the next day and the site shows its WhatsApp message instead, so
  the free allowance can never run out by surprise. It needs a small store, created once:

  ```bash
  cd worker
  npx wrangler kv namespace create USAGE      # prints an id
  ```

  Then, in `wrangler.jsonc`, remove the `//` before the `kv_namespaces` line and paste the id. Redeploy. The count
  is approximate (a burst can overshoot by a few answers), which is fine for protecting a free allowance.
- To see how much of the allowance you have used, open the Cloudflare dashboard: **Workers AI** shows usage in
  neurons against the daily free amount.

## What visitors ask (without storing what they write)

Logging is on (`observability` in `wrangler.jsonc`). Every request leaves **one anonymous line** in the Worker's
logs, such as `{"app":"egc-assistant","event":"chat","lang":"fr","topic":"travel","outcome":"ok","streamed":true,"ms":1180}`:

- `topic`: a coarse category worked out in code (`money`, `schedule`, `travel`, `contact`, `web`, `video`, `photo`,
  `design`, `process`, `about`, `attack`, `other`);
- `outcome`: `ok`, `guarded` (the answer broke a rule and was replaced), `error`, `fallback` (project description
  without the AI);
- other events: `rate_limited`, `budget`.

**Never written**: the question, the answer, the visitor's name, phone number, IP address or browser. A test
(`npm run test:worker`) checks this.

To read it: Cloudflare dashboard, **Workers & Pages**, `egc-assistant`, **Logs**; filter on `app` = `egc-assistant`
and group by `topic`. If `money` or `schedule` or `travel` keep coming up, give Egu's answer a place in the site's
FAQ (then `npm run knowledge` and redeploy). A lot of `other` or `guarded` is worth a look with `eval.mjs`.

Because nothing personal is kept, no consent banner is needed for these logs, but the site should still say that
visitors' messages are processed by Cloudflare's AI (a one-line privacy notice, to agree with Egu).

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
  past it, requests fail and the site points visitors to WhatsApp. The daily cap above keeps you under it.
- Only the origins in `ALLOWED_ORIGINS` can call it. The Worker stores nothing about visitors (see above for the anonymous log lines).
- Edit `SYSTEM`/`systemPrompt` in `index.mjs` to change the tone or the rules; the guard in
  `guard.mjs` is the safety net and has its own tests.
