const express = require("express");
const mysql = require("mysql2/promise");

// node-fetch helyes importálása (CommonJS környezetben)
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json());

// IDE KÉSŐBB: RDS helyett először lokális MySQL/MariaDB, 
// de a connection stringet már úgy írjuk, mintha "db" lenne a host (docker-compose miatt)
async function getDbConnection() {
  return await mysql.createConnection({
    host: "localhost",   // később: RDS endpoint vagy docker-compose service név
    user: "root",
    password: "",
    database: "weather_notes"
  });
}

// egyszerű health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Weather Notes API" });
});

// város hozzáadása + időjárás lekérés
app.post("/add-city", async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) return res.status(400).json({ error: "city is required" });

    // időjárás lekérés (OpenWeather – saját API kulcs kell majd)
    const apiKey = "38d1eac1e47fbc0494db1d11a5e2544d";
    const weatherResp = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=hu`
    );
    const weatherData = await weatherResp.json();

    if (weatherResp.status !== 200) {
      return res.status(400).json({ error: "Nem sikerült lekérni az időjárást", details: weatherData });
    }

    const conn = await getDbConnection();
    await conn.execute(
      "INSERT INTO cities (city_name, created_at) VALUES (?, NOW())",
      [city]
    );
    await conn.end();

    res.json({
      city,
      temp: weatherData.main.temp,
      description: weatherData.weather[0].description
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Szerver hiba" });
  }
});

// lekért városok listája
app.get("/cities", async (req, res) => {
  try {
    const conn = await getDbConnection();
    const [rows] = await conn.execute("SELECT id, city_name, created_at FROM cities ORDER BY created_at DESC");
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Szerver hiba" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
