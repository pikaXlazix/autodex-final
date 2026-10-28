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

// Estimation de secours : utilisée uniquement quand les données d'annonces
// ne contiennent pas le modèle demandé ou que la source est indisponible.
function fallbackEstimate(make, model, year) {
  const m = normalizeCarName(model);
  const b = normalizeCarName(make);
  const y = Number(year);
  const known = [
    [/tourbillon/, 3800000], [/bolide/, 4000000], [/la voiture noire/, 11000000], [/centodieci/, 8000000], [/chiron/, 3000000], [/veyron/, 1400000],
    [/valhalla/, 1000000], [/valkyrie/, 3000000], [/one77/, 1800000], [/vulcan/, 2500000], [/victor/, 3000000],
    [/f80/, 3500000], [/daytona sp3/, 2200000], [/laferrari/, 3000000], [/laferrari aperta/, 4500000], [/monza sp2/, 1800000], [/sf90/, 500000], [/296/, 330000], [/812/, 400000], [/purosangue/, 450000], [/roma/, 230000], [/portofino/, 220000], [/488 pista/, 450000], [/458 speciale/, 350000],
    [/revuelto/, 600000], [/sian/, 3500000], [/countach/, 2500000], [/aventador/, 450000], [/huracan sto/, 350000], [/huracan/, 250000], [/temerario/, 350000], [/urus/, 250000],
    [/jesko/, 3000000], [/regera/, 2000000], [/gemera/, 1700000], [/cc850/, 3500000], [/agera/, 2500000], [/one ?1/, 2500000],
    [/nevera/, 2200000], [/p1/, 1500000], [/speedtail/, 2500000], [/senna/, 1000000], [/765lt/, 500000], [/720s/, 300000], [/750s/, 350000],
    [/t50/, 2500000], [/t33/, 1800000], [/zonda/, 2500000], [/huayra/, 2500000], [/utopia/, 3000000],
    [/911 gt2 rs/, 350000], [/911 gt3 rs/, 300000], [/911 turbo s/, 250000], [/911 gt3/, 220000], [/911/, 150000], [/taycan/, 110000], [/cayenne/, 100000], [/panamera/, 110000],
    [/amg one/, 3000000], [/g 63/, 200000], [/g-class|classe g/, 180000], [/maybach/, 200000], [/s-class|classe s/, 120000],
    [/range rover/, 120000], [/defender/, 70000], [/bentayga/, 220000], [/continental gt/, 220000], [/flying spur/, 250000], [/phantom/, 500000], [/spectre/, 400000], [/cullinan/, 400000],
    [/model s plaid/, 110000], [/model s/, 85000], [/model x/, 90000], [/model y/, 50000], [/model 3/, 45000]
  ];
  let base = null;
  for (const [pattern, price] of known) { if (pattern.test(m)) { base = price; break; } }
  if (base === null) {
    const highEnd = /ferrari|lamborghini|bugatti|koenigsegg|pagani|rimac|mclaren|astonmartin|maserati|bentley|rollsroyce|lotus|porsche|maybach/.test(b);
    const luxury = /mercedes|bmw|audi|range rover|land rover|lexus|genesis|lucid|polestar|alpine/.test(b);
    const family = /suv|crossover|x[1-7]|q[2-8]|gle|gls|glc|cayenne|urus|defender|range rover/.test(m);
    const sporty = /gt|sport|coupe|coup[eé]|rs|amg|m[0-9]|type r|supra|z4|mustang|corvette|camaro|wrx|sti/.test(m);
    base = highEnd ? (sporty ? 180000 : 120000) : luxury ? (family ? 75000 : sporty ? 65000 : 50000) : (family ? 35000 : sporty ? 45000 : 25000);
  }
  // Prix de lancement approximatif puis décote indicative selon l'année.
  // Les hypercars/exemplaires de collection peuvent au contraire prendre de la valeur.
  let price = base;
  if (Number.isInteger(y) && y >= 1886 && y <= 2026) {
    const age = Math.max(0, 2026 - y);
    let factor;
    if (base >= 1000000) factor = Math.max(0.72, 1 - age * 0.012);
    else if (base >= 250000) factor = Math.max(0.35, 1 - age * 0.045);
    else if (base >= 80000) factor = Math.max(0.18, 1 - age * 0.065);
    else factor = Math.max(0.08, 1 - age * 0.075);
    price *= factor;
  }
  return Math.max(500, Math.round(price / 500) * 500);
}
function sendFallback(res, make, model, year, reason = "") {
  const price = fallbackEstimate(make, model, year);
  return res.json({
    price, make, model, year: Number(year) || null, basis: "fallback",
    source: "Estimation automatique approximative basée sur la marque, le modèle et l'année" + (reason ? ` (${reason})` : ""),
    sourceUrl: "https://karoto.fr/donnees", license: "Estimation indicative"
  });
}
app.get("/api/price-estimate", async (req, res) => {
  const make = String(req.query.make || "").trim();
  const model = String(req.query.model || "").trim();
  const year = Number(req.query.year);
  if (!make || !model) return res.status(400).json({ error: "Indique une marque et un modèle." });
  if (model === "Autre modèle" || make === "Autre / non listée") return sendFallback(res, make, model, year, "modèle personnalisé");
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
    return sendFallback(res, make, model, year, "pas assez d'annonces comparables");
  } catch (error) {
    console.error("Price lookup error:", error?.message || error);
    return sendFallback(res, make, model, year, "source de prix indisponible");
  }
});
app.get("/api/status", (_req, res) => res.json({ ready: true, message: "AutoDex FINAL prêt", priceEstimatesAvailable: true, aiAvailable: false }));
app.listen(port, () => console.log(`AutoDex FINAL running on port ${port}`));
