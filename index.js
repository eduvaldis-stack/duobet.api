export default function handler(_req, res) {
  res.status(200).json({
    ok: true,
    service: "Agencia Duobet Football API",
    fixturesEndpoint: "/api/fixtures?date=2026-07-20&timezone=America%2FGuayaquil"
  });
}
