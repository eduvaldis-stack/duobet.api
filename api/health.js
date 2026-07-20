export default function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido" });

  res.status(200).json({
    ok: true,
    service: "Agencia Duobet Football API",
    apiKeyConfigured: Boolean(process.env.API_FOOTBALL_KEY)
  });
}
