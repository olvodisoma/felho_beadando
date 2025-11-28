const API_BASE = "http://localhost:3000";

// Egy város hozzáadása
document.getElementById("addBtn").addEventListener("click", async () => {
    const city = document.getElementById("cityInput").value;
    if (!city) {
        alert("Adj meg egy várost!");
        return;
    }

    const resp = await fetch(`${API_BASE}/add-city`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
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

// Városok listázása
async function loadCities() {
    const resp = await fetch(`${API_BASE}/cities`);
    const data = await resp.json();

    const list = document.getElementById("citiesList");
    list.innerHTML = "";

    data.forEach(row => {
        const li = document.createElement("li");
        li.textContent = `${row.city_name} – ${row.degree}°C (${row.created_at})`;
        list.appendChild(li);
    });
}

loadCities();
