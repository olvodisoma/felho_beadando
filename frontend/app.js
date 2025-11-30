const API_BASE = "http://localhost:3000";

// Színezés hőmérséklet alapján
function tempClass(t) {
    if (t >= 25) return "hot";
    if (t <= 5) return "cold";
    return "warm";
}

// Város hozzáadása
document.getElementById("addBtn").addEventListener("click", async () => {
    const city = document.getElementById("cityInput").value;
    if (!city) {
        alert("Adj meg egy várost!");
        return;
    }
    document.getElementById("cityInput").value = "";

    const resp = await fetch(`${API_BASE}/add-city`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city })
    });

    const data = await resp.json();

    if (!resp.ok) {
        alert("Hiba: " + data.error);
        return;
    }

    document.getElementById("result").innerText =
        `${data.city}: ${data.temp}°C (${data.description})`;

    loadCities();
});

// Átlag, Top N, Hot, Cold gombok

document.getElementById("btnHot").addEventListener("click", async () => {
    const data = await (await fetch(`${API_BASE}/cities/hot`)).json();
    if (data) {
        document.getElementById("result").innerText =
            `Legmelegebb város: ${data.city_name} – ${data.degree}°C`;
    }
});

document.getElementById("btnCold").addEventListener("click", async () => {
    const data = await (await fetch(`${API_BASE}/cities/cold`)).json();
    if (data) {
        document.getElementById("result").innerText =
            `Leghidegebb város: ${data.city_name} – ${data.degree}°C`;
    }
});

document.getElementById("btnAvg").addEventListener("click", async () => {
    const data = await (await fetch(`${API_BASE}/degrees/avg`)).json();
    document.getElementById("result").innerText =
        `Átlaghőmérséklet: ${parseFloat(data.avg_degree).toFixed(2)}°C`;
});

document.getElementById("btnTop").addEventListener("click", async () => {
    const n = document.getElementById("topN").value || 5;
    const data = await (await fetch(`${API_BASE}/cities/top/${n}`)).json();

    let msg = `Legutóbbi ${n} város:\n`;
    data.forEach(c => msg += `${c.city_name} – ${c.degree}°C\n`);
    document.getElementById("result").innerText = msg;
});

// Város törlése
async function deleteCity(id) {
    await fetch(`${API_BASE}/city/${id}`, { method: "DELETE" });
    loadCities();
}

// Városok listázása
async function loadCities() {
    const resp = await fetch(`${API_BASE}/cities`);
    const data = await resp.json();

    const box = document.getElementById("cityCards");
    box.innerHTML = "";

    data.forEach(row => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <div><strong>${row.city_name}</strong></div>
            <div class="temp ${tempClass(row.degree)}">${row.degree}°C</div>
            <div>${row.created_at}</div>
            <button onclick="deleteCity(${row.id})">Törlés</button>
        `;

        box.appendChild(card);
    });
}

loadCities();
