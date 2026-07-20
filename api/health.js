function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
}

export default function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Método no permitido' });

  return res.status(200).json({
    ok: true,
    service: 'Agencia Duobet Football API',
    apiKeyConfigured: Boolean(process.env.API_FOOTBALL_KEY),
    fixturesEndpoint: '/api/fixtures?date=2026-07-20&timezone=America%2FGuayaquil'
  });
}
