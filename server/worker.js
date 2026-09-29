/**
 * Ritual Eats chat endpoint — a Cloudflare Worker that answers with Claude.
 *
 * Deploy: Cloudflare dashboard → Workers → Create → paste this file → Deploy.
 * Settings → Variables: ANTHROPIC_API_KEY (secret), ALLOWED_ORIGIN (e.g. https://bizstartzco.github.io).
 * Then set window.RITUAL_CHAT.endpoint in index.html to the worker URL.
 *
 * The site sends { messages: [{role, content}...], context: {open, until, opensAt, special, cart, localTime} }
 * and expects { reply: "..." }. If this endpoint is down the site falls back to its built-in bot.
 */

const MODEL = 'claude-opus-5';

const FACTS = `
Restaurant: Ritual Eats, a late-night smashburger counter. Twelve stools, four booths, one window.
Address: 12 Ritual Lane, Old Town. Two doors down from the night pharmacy; look for the amber strip light.
Phone / text: +1 (555) 012-3456 (a person answers during opening hours).
Hours: Sunday to Thursday 11:00 to 23:00. Friday and Saturday 11:00 to 01:00.
Kitchen: beef (chuck and brisket, 80/20) ground at 07:00 daily, buns baked at 05:00, no freezer, no microwave.
Patties are 70 g, smashed once on a 230°C steel, about 82 seconds per side, american cheese melted under a cloche.
Orders: pickup is free and ready in about twelve minutes; delivery is $3.50. Orders and payment happen on the website, not in chat.
Booths seat four and are booked on the website's booking form; counter stools are walk-in only; bookings are held fifteen minutes.

Menu (USD):
- The Ritual Classic $9.50: single smash, american cheese, pickles, white onion, ritual sauce, sesame brioche.
- Double Bacon Char $13.00: two patties, thick-cut bacon, smoked cheddar, crispy onion, black-pepper BBQ glaze.
- Truffle Shroom $12.50: butter-sautéed mushrooms, swiss, truffle mayo, rocket.
- Jalapeño Inferno $11.50: pepper jack, fresh and pickled jalapeño, chipotle mayo, red onion; ghost-pepper glaze on request.
- Hot Honey Bird $11.00: buttermilk-brined chicken thigh, craggy crust, slaw, pickles, hot honey.
- Beet & Bean $10.50: charred beet and black bean patty, avocado, rocket, tomato, vegan aioli, seeded bun; fully plant-based.
- Smoked-salt crinkle fries $4.00. Beer-batter onion rings $5.00. Vanilla bean shake $5.50. House cola $3.00.

Weekly specials: Sunday Truffle Shroom comes with fries; Monday Double Bacon Char two dollars off; Tuesday Hot Honey Bird with extra hot honey and a free cola;
Wednesday two Classics for the price of one and a half; Thursday Jalapeño Inferno with ghost-pepper glaze unlocked and half-price shake;
Friday Beet & Bean with a vanilla shake for $13 together; Saturday Double Bacon Char triple-patty upgrade for one dollar.
`;

const RULES = `
You are the counter bot on the Ritual Eats website. Answer like a friendly, quick member of counter staff.
Only state facts that appear in the restaurant facts or in the live page context. Never invent allergens, ingredients, parking, wifi, policies, or prices.
If asked something the facts do not cover, say you do not know and suggest texting the counter at the phone number.
Keep replies under 70 words, plain text, no markdown, no bullet lists, no emoji. One follow-up question at most.
You cannot place orders or bookings yourself; point people to the menu, the order tray, or the booking form on the page.
`;

const cors = (origin, env) => ({
  'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || origin || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
});

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = cors(origin, env);
    if (request.method === 'OPTIONS') return new Response(null, { headers });
    if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers });
    if (env.ALLOWED_ORIGIN && origin && origin !== env.ALLOWED_ORIGIN) return new Response(JSON.stringify({ error: 'origin not allowed' }), { status: 403, headers });
    if (!env.ANTHROPIC_API_KEY) return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set' }), { status: 500, headers });

    let body;
    try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'bad json' }), { status: 400, headers }); }

    const messages = (Array.isArray(body.messages) ? body.messages : [])
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-12)
      .map(m => ({ role: m.role, content: m.content.slice(0, 600) }));
    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      return new Response(JSON.stringify({ error: 'last message must be from the user' }), { status: 400, headers });
    }
    // Claude requires alternating turns; drop any leading assistant message.
    while (messages.length && messages[0].role !== 'user') messages.shift();

    const ctx = body.context || {};
    const live = `Live page context (trust this over the facts for the current moment): ` +
      `${ctx.open ? `open now, closes ${ctx.until}` : `closed now, opens ${ctx.opensAt || 'at 11:00'}`}. ` +
      `Tonight's special: ${ctx.special || 'see the site'}. Visitor's order tray: ${ctx.cart || 'unknown'}. Visitor's local time: ${ctx.localTime || 'unknown'}.`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'server-side-fallback-2026-07-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        thinking: { type: 'adaptive' },
        output_config: { effort: 'low' },
        fallbacks: 'default',
        system: [
          { type: 'text', text: RULES + '\n' + FACTS, cache_control: { type: 'ephemeral' } },
          { type: 'text', text: live },
        ],
        messages,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return new Response(JSON.stringify({ error: 'upstream ' + res.status, detail: detail.slice(0, 300) }), { status: 502, headers });
    }
    const data = await res.json();
    if (data.stop_reason === 'refusal') {
      return new Response(JSON.stringify({ reply: 'I cannot help with that one. For anything about the food, hours or a booth, ask away, or text the counter at +1 (555) 012-3456.' }), { headers });
    }
    const reply = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
    return new Response(JSON.stringify({ reply: reply || 'Sorry, say that again?' }), { headers });
  },
};
