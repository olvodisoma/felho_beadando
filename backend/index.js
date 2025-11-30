const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

// node-fetch helyes importálása (CommonJS környezetben)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

// Adatbázis kapcsolat
async function getDbConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "weather_notes",
  });
}

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Weather Notes API" });
});

// Város hozzáadása + időjárás lekérése
app.post("/add-city", async (req, res) => {
  try {
    const city = req.body?.city;
    if (!city) return res.status(400).json({ error: "city is required" });

    const apiKey = "38d1eac1e47fbc0494db1d11a5e2544d";

    const weatherResp = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${apiKey}&units=metric&lang=hu`
    );
    const weatherData = await weatherResp.json();

    if (weatherResp.status !== 200) {
      return res.status(400).json({
        error: "Nem sikerült lekérni az időjárást",
        details: weatherData,
      });
    }

    const conn = await getDbConnection();
    await conn.execute(
      "INSERT INTO cities (city_name, degree, created_at) VALUES (?, ?, NOW())",
      [city, weatherData.main.temp]
    );
    await conn.end();

    res.json({
      city,
      temp: weatherData.main.temp,
      description: weatherData.weather[0].description,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Szerver hiba" });
  }
});

// Városok listája
app.get("/cities", async (req, res) => {
  try {
    const conn = await getDbConnection();
    const [rows] = await conn.execute(
      "SELECT id, city_name, degree, created_at FROM cities ORDER BY created_at DESC"
    );
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Szerver hiba" });
  }
});

// 🔥 Legutóbbi N város
app.get("/cities/top/:n", async (req, res) => {
  try {
    const n = parseInt(req.params.n);
    const conn = await getDbConnection();
    const [rows] = await conn.execute(
      "SELECT * FROM cities ORDER BY created_at DESC LIMIT ?",
      [n]
    );
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Szerver hiba" });
  }
});

// 🔥 Legmelegebb város
app.get("/cities/hot", async (req, res) => {
  try {
    const conn = await getDbConnection();
    const [rows] = await conn.execute(
      "SELECT * FROM cities ORDER BY degree DESC LIMIT 1"
    );
    await conn.end();
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Szerver hiba" });
  }
});

// 🔥 Leghidegebb város
app.get("/cities/cold", async (req, res) => {
  try {
    const conn = await getDbConnection();
    const [rows] = await conn.execute(
      "SELECT * FROM cities ORDER BY degree ASC LIMIT 1"
    );
    await conn.end();
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Szerver hiba" });
  }
});

// 🔥 Átlaghőmérséklet
app.get("/degrees/avg", async (req, res) => {
  try {
    const conn = await getDbConnection();
    const [rows] = await conn.execute(
      "SELECT AVG(degree) AS avg_degree FROM cities"
    );
    await conn.end();
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Szerver hiba" });
  }
});

// 🔥 Város törlése
app.delete("/city/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const conn = await getDbConnection();
    const [result] = await conn.execute(
      "DELETE FROM cities WHERE id = ?",
      [id]
    );
    await conn.end();
    res.json({ deleted: result.affectedRows > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Szerver hiba" });
  }
});

// Szerver indítása
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
