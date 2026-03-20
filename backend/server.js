const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { stringify } = require("csv-stringify/sync");

const app = express();
app.use(cors());
app.use(express.json());

const ADMIN_CSV = path.join(__dirname, "database", "admininfo.csv");
const PERFUME_CSV = path.join(__dirname, "database", "perfume_database_cleaned.csv");

// ─── Helper: read admins from CSV ────────────────────────────────────────────
function readAdmins() {
  return new Promise((resolve, reject) => {
    const admins = [];
    fs.createReadStream(ADMIN_CSV)
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on("data", (row) => {
        const username = (row["Username"] || row["username"] || "").trim();
        const password = (row["Password"] || row["password"] || "").trim();
        if (username) admins.push({ username, password });
      })
      .on("end", () => resolve(admins))
      .on("error", reject);
  });
}

// ─── Helper: read perfumes from CSV ──────────────────────────────────────────
function readPerfumes() {
  return new Promise((resolve, reject) => {
    const perfumes = [];
    let id = 1;
    fs.createReadStream(PERFUME_CSV)
      .pipe(csv({ separator: "\t", mapHeaders: ({ header }) => header.trim() }))
      .on("data", (row) => {
        perfumes.push({
          id: id++,
          brand: (row["brand"] || "").trim(),
          perfume: (row["perfume"] || "").trim(),
          notes: (row["notes"] || "").trim(),
        });
      })
      .on("end", () => resolve(perfumes))
      .on("error", reject);
  });
}

// ─── Helper: write perfumes back to CSV ──────────────────────────────────────
async function writePerfumes(perfumes) {
  const rows = perfumes.map((p) => ({
    brand: p.brand,
    perfume: p.perfume,
    notes: p.notes,
  }));
  const output = stringify(rows, {
    header: true,
    columns: ["brand", "perfume", "notes"],
    delimiter: "\t",
  });
  fs.writeFileSync(PERFUME_CSV, output, "utf-8");
}

// ─── POST /api/admin/login ────────────────────────────────────────────────────
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required." });

  try {
    const admins = await readAdmins();
    const match = admins.find(
      (a) => a.username === username.trim() && a.password === password
    );
    if (match) {
      return res.json({ success: true });
    } else {
      return res.status(401).json({ error: "Invalid username or password." });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error reading admin list." });
  }
});

// ─── GET /api/perfumes ────────────────────────────────────────────────────────
app.get("/api/perfumes", async (req, res) => {
  try {
    const perfumes = await readPerfumes();
    res.json(perfumes);
  } catch (err) {
    res.status(500).json({ error: "Failed to read perfume database." });
  }
});

// ─── POST /api/perfumes ───────────────────────────────────────────────────────
app.post("/api/perfumes", async (req, res) => {
  const { brand, perfume, notes } = req.body;
  if (!brand || !perfume)
    return res.status(400).json({ error: "Brand and perfume name required." });

  try {
    const perfumes = await readPerfumes();
    const maxId = perfumes.reduce((m, p) => Math.max(m, p.id), 0);
    const newEntry = { id: maxId + 1, brand, perfume, notes: notes || "" };
    perfumes.push(newEntry);
    await writePerfumes(perfumes);
    res.json({ success: true, perfume: newEntry });
  } catch (err) {
    res.status(500).json({ error: "Failed to save perfume." });
  }
});

// ─── PUT /api/perfumes/:id ────────────────────────────────────────────────────
app.put("/api/perfumes/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { brand, perfume, notes } = req.body;
  if (!brand || !perfume)
    return res.status(400).json({ error: "Brand and perfume name required." });

  try {
    const perfumes = await readPerfumes();
    const idx = perfumes.findIndex((p) => p.id === id);
    if (idx === -1) return res.status(404).json({ error: "Perfume not found." });

    perfumes[idx] = { id, brand, perfume, notes: notes || "" };
    await writePerfumes(perfumes);
    res.json({ success: true, perfume: perfumes[idx] });
  } catch (err) {
    res.status(500).json({ error: "Failed to update perfume." });
  }
});

// ─── DELETE /api/perfumes/:id ─────────────────────────────────────────────────
app.delete("/api/perfumes/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const perfumes = await readPerfumes();
    const filtered = perfumes.filter((p) => p.id !== id);
    if (filtered.length === perfumes.length)
      return res.status(404).json({ error: "Perfume not found." });
    await writePerfumes(filtered);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete perfume." });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));