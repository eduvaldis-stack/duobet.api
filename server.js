import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;
const API_KEY = process.env.API_FOOTBALL_KEY;
const API_BASE = "https://v3.football.api-sports.io";

app.disable("x-powered-by");
app.use(cors({ origin: true, methods: ["GET", "OPTIONS"] }));
app.use(express.json({ limit: "20kb" }));

const cache = new Map();
const CACHE_MS = 15 * 60 * 1000;

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "Agencia Duobet Football API" });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, apiKeyConfigured: Boolean(API_KEY) });
});

app.get("/fixtures", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: "Falta configurar API_FOOTBALL_KEY en Render." });
  }

  const date = String(req.query.date || "").trim();
  const timezone = String(req.query.timezone || "America/Guayaquil").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Fecha inválida. Use YYYY-MM-DD." });
  }

  const cacheKey = `${date}|${timezone}`;
  const saved = cache.get(cacheKey);
  if (saved && Date.now() - saved.time < CACHE_MS) {
    res.set("X-Duobet-Cache", "HIT");
    return res.status(200).json(saved.data);
  }

  try {
    const url = new URL(`${API_BASE}/fixtures`);
    url.searchParams.set("date", date);
    url.searchParams.set("timezone", timezone);

    const response = await fetch(url, {
      headers: { "x-apisports-key": API_KEY },
      signal: AbortSignal.timeout(20000)
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    cache.set(cacheKey, { time: Date.now(), data });
    res.set("X-Duobet-Cache", "MISS");
    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({
      error: "No se pudo consultar API-Football.",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Duobet Football API activa en puerto ${PORT}`);
});
