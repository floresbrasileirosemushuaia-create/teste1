/**
 * Vercel Serverless Function
 * Path obrigatório: /api/gas.js
 * (CommonJS) para funcionar mesmo sem package.json / type:module
 */
module.exports = async (req, res) => {
  // CORS (mesma origem no Vercel, mas deixo liberado p/ debug)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(200).json({ ok: false, data: null, error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const GAS_WEBAPP_URL =
    process.env.GAS_WEBAPP_URL ||
    'https://script.google.com/macros/s/AKfycbzh4ieD1tp5NZsrBQE-PF-k2YJujdg0VdkB99XUHCg6qFSBejSmDPpkFWbEpRFSsTmK/exec';

  let body = req.body;

  // Se vier string (depende do Content-Type), tenta parsear
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }

  // Se vier vazio (Content-Type text/plain em alguns casos)
  // tenta ler raw body do stream
  if (!body) {
    try {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const raw = Buffer.concat(chunks).toString('utf8');
      body = raw ? JSON.parse(raw) : null;
    } catch (e) {
      body = null;
    }
  }

  if (!body || !body.action) {
    res.status(200).json({ ok: false, data: null, error: 'BAD_REQUEST' });
    return;
  }

  try {
    const r = await fetch(GAS_WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // GAS sem preflight
      body: JSON.stringify(body),
    });

    const txt = await r.text();

    try {
      const parsed = JSON.parse(txt);
      res.status(200).json(parsed);
    } catch (e) {
      res.status(200).json({ ok: false, data: null, error: 'GAS_NON_JSON', raw: txt });
    }
  } catch (e) {
    const msg = e && e.message ? e.message : String(e || 'ERROR');
    res.status(200).json({ ok: false, data: null, error: msg });
  }
};
