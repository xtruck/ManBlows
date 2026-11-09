# EGC assistant Worker (Cloudflare Workers AI)

Answers the free questions typed in the site's assistant. The guided request (service, date,
place… then WhatsApp) does not need it and keeps working without it.

## Deploy (once, from your own computer)

```bash
cd worker
npx wrangler login      # opens Cloudflare in the browser
npx wrangler deploy     # prints https://egc-assistant.<your-account>.workers.dev
```

Then give that URL to the site build: GitHub, repository **Settings → Secrets and variables →
Actions → Variables → New repository variable**, name `ASSISTANT_URL`, value the Worker URL.
Re-run the "Deploy to GitHub Pages" workflow. Without this variable the free-question box stays hidden.

## Check

```bash
curl -s https://egc-assistant.<your-account>.workers.dev \
  -H "Origin: https://xtruck.github.io" -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Vous faites des mariages ?"}]}'
```

## Notes

- `MODEL` (in `wrangler.jsonc`) is a Workers AI chat model id. Check it against Cloudflare's model
  list before deploying, and switch to a newer small instruct model if it was retired.
- Workers AI has a free daily allowance; past it, requests fail and the site shows a message that
  points to WhatsApp. For a hard cap per visitor, add a Cloudflare rate-limiting rule on the Worker.
- Only the origins in `ALLOWED_ORIGINS` can call it. The prompt forbids prices, dates and travel
  zones (Egu sets them in his quote); edit `SYSTEM` in `index.mjs` to change the rules.
