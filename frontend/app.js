const API_BASE = "http://3.123.35.179:3000";

function tempClass(t) {
    if (t >= 25) return "hot";
    if (t <= 5) return "cold";
    return "warm";
}

// Város hozzáadása
document.getElementById("addBtn").addEventListener("click", async () => {
    const city = document.getElementById("cityInput").value;
    if (!city) return alert("Adj meg egy várost!");
    document.getElementById("cityInput").value = "";

    const resp = await fetch(`${API_BASE}/add-city`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city })
    });

    const data = await resp.json();
    if (!resp.ok) return alert("Hiba: " + data.error);

    document.getElementById("result").innerText =
        `${data.city}: ${data.temp}°C (${data.description})`;

    loadCities();
});

// Lekérdezések
document.getElementById("btnHot").addEventListener("click", async () => {
    const d = await (await fetch(`${API_BASE}/cities/hot`)).json();
    if (d) document.getElementById("result").innerText =
        `🔥 Legmelegebb város: ${d.city_name} — ${d.degree}°C`;
});

document.getElementById("btnCold").addEventListener("click", async () => {
    const d = await (await fetch(`${API_BASE}/cities/cold`)).json();
    if (d) document.getElementById("result").innerText =
        `❄️ Leghidegebb város: ${d.city_name} — ${d.degree}°C`;
});

document.getElementById("btnAvg").addEventListener("click", async () => {
    const d = await (await fetch(`${API_BASE}/degrees/avg`)).json();
    const avg = parseFloat(d.avg_degree);

    document.getElementById("result").innerText =
        `📊 Átlaghőmérséklet: ${avg.toFixed(2)}°C`;

    setBackgroundTheme(avg);
});

document.getElementById("btnTop").addEventListener("click", async () => {
    const n = document.getElementById("topN").value || 5;
    const d = await (await fetch(`${API_BASE}/cities/top/${n}`)).json();

    let msg = `🏆 Legutóbbi ${n} város:\n`;
    d.forEach(c => msg += `${c.city_name} – ${c.degree}°C\n`);

    document.getElementById("result").innerText = msg;
});

// Város törlése
async function deleteCity(id) {
    await fetch(`${API_BASE}/city/${id}`, { method: "DELETE" });
    loadCities();
}

// Kártyák kirajzolása
async function loadCities() {
    const resp = await fetch(`${API_BASE}/cities`);
    const data = await resp.json();

    const box = document.getElementById("cityCards");
    box.innerHTML = "";

    data.forEach(row => {
        const card = document.createElement("div");
        card.className = "city-card";

        card.innerHTML = `
            <div class="city-title">${row.city_name}</div>
            <div class="temp ${tempClass(row.degree)}">${row.degree}°C</div>
            <div class="date">${row.created_at}</div>
            <button class="delete-btn" onclick="deleteCity(${row.id})">Törlés</button>
        `;

        box.appendChild(card);
    });
}

/* ========= HÁTTÉR TÉMA + HÓ KEZELÉS ========= */

function setBackgroundTheme(avg) {
    const bg = document.getElementById("bg");
    if (!bg) return;

    // alap class visszaállítása
    bg.className = "bg-layer";

    if (avg == null || isNaN(avg)) {
        bg.classList.add("theme-default");
    } else if (avg <= 5) {
        bg.classList.add("theme-winter");
    } else if (avg <= 15) {
        bg.classList.add("theme-summer");
    } else if (avg <= 25) {
        bg.classList.add("theme-summer");
    } else {
        bg.classList.add("theme-heat");
    }

    // Aktuális téma meghatározása
    let theme = "default";
    if (bg.classList.contains("theme-winter")) theme = "winter";
    else if (bg.classList.contains("theme-spring")) theme = "spring";
    else if (bg.classList.contains("theme-summer")) theme = "summer";
    else if (bg.classList.contains("theme-heat")) theme = "heat";

    // --- Effektusok váltása a téma alapján ---
    if (theme === "winter") {
        generateSnowflakes(350);
        clearSeasonFx();
    } else {
        clearSnow();
        if (theme === "spring") {
            generateSpringFx(90);
        } else if (theme === "summer") {
            generateSummerFx(60);
        } else if (theme === "heat") {
            generateHeatFx(120);
        } else {
            clearSeasonFx();
        }
    }
}

/* RANDOM HÓGENERÁLÁS – minden pelyhet JS készít */

function generateSnowflakes(count = 300) {
    const container = document.getElementById("snow-container");
    if (!container) return;

    // régi pelyhek törlése, hogy ne nőjön a DOM végtelenre
    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const flake = document.createElement("div");
        flake.className = "snowflake";

        // random méret
        const size = Math.random() * 3 + 2; // 2–5 px
        flake.style.width = size + "px";
        flake.style.height = size + "px";

        // random vízszintes pozíció
        flake.style.left = Math.random() * 100 + "vw";

        // kicsit a viewport fölül induljon
        flake.style.top = Math.random() * -100 + "px";

        // random sebesség (időtartam)
        const duration = Math.random() * 10 + 8; // 8–18s
        flake.style.animationDuration = duration + "s";

        // random késleltetés
        const delay = Math.random() * 10;
        flake.style.animationDelay = delay + "s";

        container.appendChild(flake);
    }
}

function clearSnow() {
    const container = document.getElementById("snow-container");
    if (!container) return;
    container.innerHTML = "";
}

/* ========= SEASON FX – TAVASZ / NYÁR / HŐHULLÁM ========= */

function clearSeasonFx() {
    const container = document.getElementById("season-fx");
    if (!container) return;
    container.innerHTML = "";
}

// ---- TAVASZ: LEVELEK / SZIRMOK ----
function generateSpringFx(count = 80) {
    const container = document.getElementById("season-fx");
    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const leaf = document.createElement("div");
        leaf.className = "leaf";

        // random kezdőpozíció
        leaf.style.left = Math.random() * 100 + "vw";
        leaf.style.top = Math.random() * -50 + "px";

        // random sebesség
        const duration = Math.random() * 10 + 10; // 10–20s
        leaf.style.animationDuration = duration + "s";

        // random késleltetés
        const delay = Math.random() * 10;
        leaf.style.animationDelay = delay + "s";

        container.appendChild(leaf);
    }
}

// ---- NYÁR: SZENTJÁNOSBOGARAK ----
function generateSummerFx(count = 50) {
    const container = document.getElementById("season-fx");
    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const bug = document.createElement("div");
        bug.className = "firefly";

        // vízszintesen random, függőlegesen inkább alsó 2/3-ban
        bug.style.left = Math.random() * 100 + "vw";
        bug.style.top = (Math.random() * 60 + 30) + "vh";

        const duration = Math.random() * 8 + 8; // 8–16s
        bug.style.animationDuration = duration + "s";

        const delay = Math.random() * 10;
        bug.style.animationDelay = delay + "s";

        container.appendChild(bug);
    }
}

// ---- HŐHULLÁM: FELFELÉ SZÁLLÓ POR/HŐSZIKRÁK ----
function generateHeatFx(count = 100) {
    const container = document.getElementById("season-fx");
    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const dust = document.createElement("div");
        dust.className = "dust";

        // lent, alulról indul
        dust.style.left = Math.random() * 100 + "vw";
        dust.style.bottom = Math.random() * 20 + "vh";

        const duration = Math.random() * 8 + 6; // 6–14s
        dust.style.animationDuration = duration + "s";

        const delay = Math.random() * 8;
        dust.style.animationDelay = delay + "s";

        container.appendChild(dust);
    }
}


/* ========= INIT ========= */

async function init() {
    try {
        const resp = await fetch(`${API_BASE}/degrees/avg`);
        const d = await resp.json();
        const avg = parseFloat(d.avg_degree);

        setBackgroundTheme(avg);

        // ha valahol kiírod az átlagot:
        const resultBox = document.getElementById("result");
        if (resultBox) {
            resultBox.innerText = `📊 Átlaghőmérséklet: ${avg.toFixed(2)}°C`;
        }
    } catch (e) {
        console.error(e);
        setBackgroundTheme(null); // default háttér
    }

    loadCities();
}

init();
