// AutoDex FINAL — serveur sans IA, avec estimation de prix à partir de données publiques.
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "public")));

const PRICE_DATA_URLS = {
  byYear: "https://karoto.fr/donnees/prix-modeles-annees.csv",
  byModel: "https://karoto.fr/donnees/cotes-modeles.csv"
};
const priceCache = { byYear: null, byModel: null };
const PRICE_CACHE_MS = 6 * 60 * 60 * 1000;

function parseCsvLine(line) {
  const fields = []; let field = "", quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === "," && !quoted) { fields.push(field); field = ""; }
    else field += ch;
  }
  fields.push(field); return fields;
}
function normalizeCarName(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
async function loadPriceCsv(key) {
  const cached = priceCache[key];
  if (cached && Date.now() - cached.loadedAt < PRICE_CACHE_MS) return cached.rows;
  const response = await fetch(PRICE_DATA_URLS[key], { headers: { "User-Agent": "AutoDex/1.0 price-estimator" } });
  if (!response.ok) throw new Error(`Source de prix indisponible (${response.status})`);
  const csv = (await response.text()).replace(/^\uFEFF/, "");
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error("Fichier de prix vide");
  const headers = parseCsvLine(lines[0]).map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, i) => [header, (values[i] || "").trim()]));
  });
  priceCache[key] = { loadedAt: Date.now(), rows };
  return rows;
}
function validPrice(value) {
  const n = Number(String(value || "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}
app.get("/api/price-estimate", async (req, res) => {
  const make = String(req.query.make || "").trim();
  const model = String(req.query.model || "").trim();
  const year = Number(req.query.year);
  if (!make || !model) return res.status(400).json({ error: "Indique une marque et un modèle." });
  if (model === "Autre modèle" || make === "Autre / non listée") return res.status(404).json({ error: "Aucune cote trouvée pour cette saisie. Tu peux entrer le prix manuellement." });
  try {
    const [yearRows, modelRows] = await Promise.all([loadPriceCsv("byYear"), loadPriceCsv("byModel")]);
    const wantedMake = normalizeCarName(make), wantedModel = normalizeCarName(model);
    const matchesYear = yearRows.filter(row => normalizeCarName(row.marque) === wantedMake && normalizeCarName(row.modele) === wantedModel);
    const exactYear = Number.isInteger(year) && year >= 1886 && year <= 2100
      ? matchesYear.find(row => Number(row.annee) === year && validPrice(row.prix_median_france_eur)) : null;
    if (exactYear) return res.json({
      price: validPrice(exactYear.prix_median_france_eur), make: exactYear.marque, model: exactYear.modele,
      year: Number(exactYear.annee), mileageMedian: Number(exactYear.km_median_france) || null,
      listings: Number(exactYear.annonces_france) || null, basis: "year", date: exactYear.date_extraction || "",
      source: "Karoto — médiane des annonces françaises pour ce modèle et cette année",
      sourceUrl: "https://karoto.fr/donnees", license: "Licence Ouverte 2.0"
    });
    const modelRow = modelRows.find(row => normalizeCarName(row.marque) === wantedMake && normalizeCarName(row.modele) === wantedModel && validPrice(row.prix_median_france_eur));
    if (modelRow) return res.json({
      price: validPrice(modelRow.prix_median_france_eur), make: modelRow.marque, model: modelRow.modele,
      year: Number(modelRow.reference_annee) || null, mileageMedian: Number(modelRow.reference_km) || null,
      listings: Number(modelRow.annonces_france) || null, basis: "model", date: modelRow.date_calcul || "",
      requestedYear: Number.isInteger(year) && year >= 1886 && year <= 2100 ? year : null,
      source: "Karoto — médiane des annonces françaises du modèle, toutes années confondues",
      sourceUrl: "https://karoto.fr/donnees", license: "Licence Ouverte 2.0"
    });
    return res.status(404).json({ error: "Pas assez d'annonces comparables pour donner une estimation fiable. Tu peux entrer le prix manuellement." });
  } catch (error) {
    console.error("Price lookup error:", error?.message || error);
    return res.status(502).json({ error: "La source des prix est temporairement indisponible. Réessaie plus tard ou saisis le prix manuellement." });
  }
});
app.get("/api/status", (_req, res) => res.json({ ready: true, message: "AutoDex FINAL prêt", priceEstimatesAvailable: true, aiAvailable: false }));
app.listen(port, () => console.log(`AutoDex FINAL running on port ${port}`));
