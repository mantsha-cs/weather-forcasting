const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

const citySelect = document.getElementById("citySelect");
const searchForm = document.getElementById("searchForm");
const locationBtn = document.getElementById("locationBtn");
const themeBtn = document.getElementById("themeBtn");

const cityName = document.getElementById("cityName");
const weatherCondition = document.getElementById("weatherCondition");
const temperature = document.getElementById("temperature");
const weatherIcon = document.getElementById("weatherIcon");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");
const uvIndex = document.getElementById("uvIndex");

const weatherTip = document.getElementById("weatherTip");
const hourlyForecast = document.getElementById("hourlyForecast");
const forecastContainer = document.getElementById("forecastContainer");

const loader = document.getElementById("loader");
const errorBox = document.getElementById("errorBox");
const recentSearches = document.getElementById("recentSearches");

const lastUpdated = document.getElementById("lastUpdated");

/* ==========================================================================
   STATE & INITIALIZATION
   ========================================================================== */

let lastCity = "New Delhi";

window.addEventListener("DOMContentLoaded", () => {
    startClock();
    loadTheme();
    loadRecentSearches();
    getWeatherByCity(lastCity);
});

function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("hidden");
    setTimeout(() => {
        errorBox.classList.add("hidden");
    }, 3000);
}

function showLoader() {
    loader.classList.remove("hidden");
}

function hideLoader() {
    loader.classList.add("hidden");
}

/* ==========================================================================
   WEATHER BY CITY (GEOCODING)
   ========================================================================== */

async function getWeatherByCity(city) {
    try {
        showLoader();

        const res = await fetch(`${GEO_URL}?name=${encodeURIComponent(city)}&count=1`);
        const data = await res.json();

        if (!data.results || data.results.length === 0) {
            showError("City not found");
            return;
        }

        const loc = data.results[0];
        await getWeather(loc.latitude, loc.longitude, loc.name);
        
        saveRecentSearch(loc.name);
        lastCity = loc.name;

    } catch (err) {
        showError("Failed to fetch city data");
    } finally {
        hideLoader();
    }
}

/* ==========================================================================
   WEATHER FETCH (FORECAST)
   ========================================================================== */

async function getWeather(lat, lon, city) {
    try {
        showLoader();

        // Cleaned up template literal spacing to prevent malformed URL errors
        const url = `${WEATHER_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,pressure_msl,wind_speed_10m&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,uv_index_max&timezone=auto`;

        const res = await fetch(url);
        const data = await res.json();

        updateCurrent(data, city);
        updateHourly(data);
        updateForecast(data);

        lastUpdated.textContent = new Date().toLocaleTimeString();

    } catch (err) {
        showError("Weather fetch failed");
    } finally {
        hideLoader();
    }
}

/* ==========================================================================
   DOM RENDERING & UPDATES
   ========================================================================== */

function updateCurrent(data, city) {
    cityName.textContent = city;
    temperature.textContent = Math.round(data.current.temperature_2m);
    humidity.textContent = data.current.relative_humidity_2m + "%";
    windSpeed.textContent = data.current.wind_speed_10m + " km/h";
    pressure.textContent = Math.round(data.current.pressure_msl) + " hPa";
    uvIndex.textContent = Math.round(data.daily.uv_index_max[0]);

    const weather = getWeatherInfo(data.current.weather_code);
    weatherCondition.textContent = weather.condition;
    weatherIcon.className = `fa-solid ${weather.icon}`;

    weatherTip.textContent = generateTip(data.current.temperature_2m);
}

function updateHourly(data) {
    hourlyForecast.innerHTML = "";

    // Find the index that corresponds closest to the current hour
    const currentISOString = new Date().toISOString().slice(0, 13); // Format: "YYYY-MM-DDTHH"
    let startIndex = data.hourly.time.findIndex(t => t.startsWith(currentISOString));
    
    // Fallback if index not found
    if (startIndex === -1) startIndex = new Date().getHours();

    for (let i = 0; i < 8; i++) {
        const index = startIndex + i;
        const time = data.hourly.time[index];

        if (!time) continue;

        const card = document.createElement("div");
        card.classList.add("hour-card");

        card.innerHTML = `
            <p>${time.slice(11, 16)}</p>
            <h3>${Math.round(data.hourly.temperature_2m[index])}°</h3>
        `;
        hourlyForecast.appendChild(card);
    }
}

function updateForecast(data) {
    forecastContainer.innerHTML = "";

    for (let i = 0; i < 5; i++) {
        const date = new Date(data.daily.time[i]);
        const weather = getWeatherInfo(data.daily.weather_code[i]);

        const card = document.createElement("div");
        card.classList.add("forecast-card");

        card.innerHTML = `
            <h3>${date.toLocaleDateString("en-US", { weekday: "long" })}</h3>
            <i class="fa-solid ${weather.icon}"></i>
            <p>Max: ${Math.round(data.daily.temperature_2m_max[i])}°C</p>
            <p>Min: ${Math.round(data.daily.temperature_2m_min[i])}°C</p>
        `;
        forecastContainer.appendChild(card);
    }
}

/* ==========================================================================
   HELPERS & UTILITIES
   ========================================================================== */

function getWeatherInfo(code) {
    if (code === 0) return { condition: "Clear Sky", icon: "fa-sun" };
    if (code <= 3) return { condition: "Cloudy", icon: "fa-cloud" };
    if (code <= 48) return { condition: "Fog", icon: "fa-smog" };
    if (code <= 67) return { condition: "Rain", icon: "fa-cloud-rain" };
    if (code <= 77) return { condition: "Snow", icon: "fa-snowflake" };
    if (code <= 82) return { condition: "Showers", icon: "fa-cloud-showers-heavy" };

    return { condition: "Storm", icon: "fa-bolt" };
}

function generateTip(temp) {
    if (temp > 38) return "Extreme heat. Stay indoors.";
    if (temp > 30) return "Hot weather. Stay hydrated.";
    if (temp < 10) return "Cold weather. Wear warm clothes.";
    return "Perfect weather for outdoor activities.";
}

function startClock() {
    function updateClock() {
        const now = new Date();
        const liveClockEl = document.getElementById("liveClock");
        const currentDateEl = document.getElementById("currentDate");
        
        if (liveClockEl) liveClockEl.textContent = now.toLocaleTimeString();
        if (currentDateEl) currentDateEl.textContent = now.toDateString();
    }
    updateClock();
    setInterval(updateClock, 1000);
}

/* ==========================================================================
   THEME MANAGEMENT
   ========================================================================== */

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme", document.body.classList.contains("light-mode"));
});

function loadTheme() {
    if (localStorage.getItem("theme") === "true") {
        document.body.classList.add("light-mode");
    }
}

/* ==========================================================================
   EVENT LISTENERS & PERSISTENCE
   ========================================================================== */

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const city = citySelect.value.trim();
    if (!city) return;
    getWeatherByCity(city);
});

locationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        showError("Geolocation not supported by your browser");
        return;
    }

    showLoader();
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            await getWeather(pos.coords.latitude, pos.coords.longitude, "Your Location");
            hideLoader();
        },
        (err) => {
            showError("Location permission denied or unavailable");
            hideLoader();
        }
    );
});

function saveRecentSearch(city) {
    let list = JSON.parse(localStorage.getItem("recentCities")) || [];
    list = list.filter(c => c.toLowerCase() !== city.toLowerCase());
    list.unshift(city);
    list = list.slice(0, 5);

    localStorage.setItem("recentCities", JSON.stringify(list));
    loadRecentSearches();
}

function loadRecentSearches() {
    recentSearches.innerHTML = "";
    const list = JSON.parse(localStorage.getItem("recentCities")) || [];

    list.forEach(city => {
        const div = document.createElement("div");
        div.classList.add("recent-item");
        div.textContent = city;
        div.onclick = () => getWeatherByCity(city);
        recentSearches.appendChild(div);
    });
}

// Auto-refresh weather every 10 minutes
setInterval(() => {
    if (lastCity && lastCity !== "Your Location") {
        getWeatherByCity(lastCity);
    }
}, 600000);