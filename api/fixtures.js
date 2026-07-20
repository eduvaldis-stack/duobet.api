const API_BASE = 'https://v3.football.api-sports.io';
const ALLOWED_TIMEZONES = new Set(['America/Guayaquil', 'UTC']);

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Método no permitido' });

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      error: 'Falta configurar API_FOOTBALL_KEY en Vercel.'
    });
  }

  const date = String(req.query.date || '').trim();
  const requestedTimezone = String(req.query.timezone || 'America/Guayaquil').trim();
  const timezone = ALLOWED_TIMEZONES.has(requestedTimezone)
    ? requestedTimezone
    : 'America/Guayaquil';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ ok: false, error: 'Fecha inválida. Usa YYYY-MM-DD.' });
  }

  const url = new URL(`${API_BASE}/fixtures`);
  url.searchParams.set('date', date);
  url.searchParams.set('timezone', timezone);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, {
      headers: { 'x-apisports-key': apiKey },
      signal: controller.signal
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { ok: false, error: 'API-Football devolvió una respuesta no válida.', detail: text.slice(0, 300) };
    }

    if (!response.ok) return res.status(response.status).json(data);
    return res.status(200).json(data);
  } catch (error) {
    const detail = error?.name === 'AbortError'
      ? 'La consulta tardó demasiado.'
      : (error?.message || String(error));

    return res.status(502).json({
      ok: false,
      error: 'No se pudo consultar API-Football.',
      detail
    });
  } finally {
    clearTimeout(timer);
  }
}
