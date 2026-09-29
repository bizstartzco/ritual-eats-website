# Chat endpoint (optional)

The site's chat works with no server at all: the built-in counter bot answers from the page's own
data (hours, menu, prices, tonight's special, address, booking rules) and can add items to the
order tray. This folder is for the optional upgrade where replies come from Claude.

## Why a server is needed

The site is static (GitHub Pages). An API key in the page would be visible to every visitor, so the
key has to live on a small server that the page calls. `worker.js` is that server, written for
Cloudflare Workers (free tier is plenty for a restaurant site).

## Deploy in five minutes

1. Cloudflare dashboard → Workers & Pages → Create → Start with Hello World → Deploy.
2. Edit code → replace everything with `worker.js` → Deploy.
3. Settings → Variables and Secrets:
   - `ANTHROPIC_API_KEY` (type: secret) — from console.anthropic.com
   - `ALLOWED_ORIGIN` — the site's origin, e.g. `https://bizstartzco.github.io`
4. Copy the worker URL (looks like `https://ritual-chat.<account>.workers.dev`).
5. In `index.html`, near the top of the script, set:

   ```js
   window.RITUAL_CHAT = { endpoint: 'https://ritual-chat.<account>.workers.dev', phone: '+1 (555) 012-3456', smsHref: 'sms:+15550123456' };
   ```

If the endpoint is down or slow, the page quietly falls back to the built-in bot.

## What the model is told

`FACTS` in `worker.js` holds the restaurant facts (hours, menu, prices, specials, address). Keep it in
step with the page when the menu changes. `RULES` keeps answers short, plain, and honest: the model
is told not to invent allergens, policies or prices and to hand off to the phone number instead.

The page also sends live context with each message: whether the restaurant is open right now,
tonight's special, and what is on the visitor's tray.

## Model and cost

The worker calls `claude-opus-5` with low effort and a cached system prompt. A typical reply costs
well under a cent. Refusal fallbacks are enabled (`fallbacks: "default"`), so a safety decline is
retried on another model inside the same call rather than ending the chat.

## Not included

Rate limiting and abuse protection. For a public restaurant site, add Cloudflare's built-in rate
limiting rule on the worker route (Security → WAF → Rate limiting) before going live.
