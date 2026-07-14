# Weather Dash 🌤️

A modern, responsive, and lightweight weather dashboard application built using vanilla JavaScript, HTML5, and CSS3. The application fetches accurate global data using the **Open-Meteo Geocoding and Weather Forecast APIs** and offers persistent customization via LocalStorage.

## 🚀 Features

- **Real-Time Weather Data:** Displays current temperature, relative humidity, wind speed, barometric pressure, and UV index.
- **Dynamic Forecasts:** Provides an 8-hour rolling hourly forecast alongside a 5-day weather outlook.
- **Location Auto-Detection:** Integrates browser Geolocation to fetch local conditions instantly.
- **Persistent Recent Searches:** Remembers your last 5 searched cities using `localStorage` for quick re-fetching.
- **Smart Weather Advice:** Automatically generates tailored outdoor activity recommendations based on temperature triggers.
- **Toggleable Dark/Light Theme:** User theme preferences persist across browser reloads.
- **Auto-Refresh:** Automatically refreshes data every 10 minutes to ensure you are seeing up-to-date conditions.

---

## 🛠️ Built With

* [Open-Meteo API](https://open-meteo.com/) - Free and open-source weather data.
* [FontAwesome](https://fontawesome.com/) - Crisp, scalable weather and system vector icons.
* **Vanilla JavaScript** - No bloated frameworks; optimal execution speed and standard asynchronous fetch mechanics.

---

## 📂 Project Structure

```text
├── index.html       # Application core UI layout
├── style.css        # Layout grids, dark/light theme tokens, and typography
└── app.js           # Main application state logic and API handling
