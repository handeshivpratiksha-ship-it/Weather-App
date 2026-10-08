const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");


const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const weatherCondition = document.getElementById("weatherCondition");
const weatherIcon = document.getElementById("weatherIcon");

const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feelsLike = document.getElementById("feelsLike");

const forecast = document.getElementById("forecast");
const errorMessage = document.getElementById("errorMessage");

searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();

    if (city === "") {
        errorMessage.textContent = "Please enter a city name.";
        errorMessage.classList.remove("loading");
        return;
    }

    getWeather(city);
});

cityInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});

locationBtn.addEventListener("click", () => {

    if (!navigator.geolocation) {
        errorMessage.textContent =
            "❌ Your browser does not support location.";
        return;
    }

    errorMessage.textContent = "📍 Getting your location...";
    errorMessage.classList.add("loading");

    locationBtn.disabled = true;
    locationBtn.textContent = "Getting Location...";

    navigator.geolocation.getCurrentPosition(
        async (position) => {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
                const response = await fetch(
                    `/api/weather?lat=${lat}&lon=${lon}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Unable to get weather");
                }

                const weather = data.weather;
                const forecastData = data.forecast;

                cityName.textContent =
                    `${weather.name}, ${weather.sys.country}`;

                temperature.textContent =
                    `${Math.round(weather.main.temp)}°C`;

                weatherCondition.textContent =
                    weather.weather[0].description;

                humidity.textContent =
                    `${weather.main.humidity}%`;

                wind.textContent =
                    `${(weather.wind.speed * 3.6).toFixed(1)} km/h`;

                feelsLike.textContent =
                    `${Math.round(weather.main.feels_like)}°C`;

                const condition = weather.weather[0].main;

                weatherIcon.textContent =
                    getWeatherEmoji(condition);

                setWeatherBackground(condition);

                showForecast(forecastData);

                errorMessage.textContent = "";
                errorMessage.classList.remove("loading");

            } catch (error) {

                errorMessage.textContent =
                    "❌ Unable to get weather for your location.";

                errorMessage.classList.remove("loading");
            }

            locationBtn.disabled = false;
            locationBtn.textContent = "📍 Use My Location";
        },

        () => {

            errorMessage.textContent =
                "❌ Location permission was denied.";

            errorMessage.classList.remove("loading");

            locationBtn.disabled = false;
            locationBtn.textContent = "📍 Use My Location";
        }
    );
});

async function getWeather(city) {

    // Loading state
    errorMessage.textContent = "⏳ Getting weather...";
    errorMessage.classList.add("loading");

    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";

    try {
        const response = await fetch(
            `/api/weather?city=${encodeURIComponent(city)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "City not found");
        }

        const weather = data.weather;
        const forecastData = data.forecast;

        cityName.textContent =
            `${weather.name}, ${weather.sys.country}`;

        temperature.textContent =
            `${Math.round(weather.main.temp)}°C`;

        weatherCondition.textContent =
            weather.weather[0].description;

        humidity.textContent =
            `${weather.main.humidity}%`;

        wind.textContent =
            `${(weather.wind.speed * 3.6).toFixed(1)} km/h`;

        feelsLike.textContent =
            `${Math.round(weather.main.feels_like)}°C`;

        const condition = weather.weather[0].main;

        weatherIcon.textContent =
            getWeatherEmoji(condition);

        setWeatherBackground(condition);

        showForecast(forecastData);

        // Remove loading message
        errorMessage.textContent = "";
        errorMessage.classList.remove("loading");

    } catch (error) {

        errorMessage.textContent =
            "❌ City not found. Please try again.";

        errorMessage.classList.remove("loading");

        cityName.textContent = "Search for a city";
        temperature.textContent = "--°C";
        weatherCondition.textContent = "---";
        humidity.textContent = "--%";
        wind.textContent = "-- km/h";
        feelsLike.textContent = "--°C";
        weatherIcon.textContent = "🌤️";

        forecast.innerHTML = "";

        document.body.className = "weather-default";
    }

    // Reset button
    searchBtn.disabled = false;
    searchBtn.textContent = "Search";
}

function showForecast(data) {
    forecast.innerHTML = "";

    const dailyForecast = data.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
    );

    dailyForecast.slice(0, 5).forEach((day) => {
        const date = new Date(day.dt * 1000);

        const dayName = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const card = document.createElement("div");
        card.classList.add("forecast-card");

        card.innerHTML = `
            <p>${dayName}</p>
            <span>${getWeatherEmoji(day.weather[0].main)}</span>
            <strong>${Math.round(day.main.temp)}°C</strong>
        `;

        forecast.appendChild(card);
    });
}

function getWeatherEmoji(condition) {
    switch (condition.toLowerCase()) {
        case "clear":
            return "☀️";

        case "clouds":
            return "☁️";

        case "rain":
            return "🌧️";

        case "drizzle":
            return "🌦️";

        case "thunderstorm":
            return "⛈️";

        case "snow":
            return "❄️";

        case "mist":
        case "fog":
        case "haze":
            return "🌫️";

        default:
            return "🌤️";
    }
}

function setWeatherBackground(condition) {
    document.body.className = "";

    const currentHour = new Date().getHours();
    const isNight = currentHour >= 19 || currentHour < 6;

    if (isNight) {
        document.body.classList.add("weather-night");
        return;
    }

    switch (condition.toLowerCase()) {
        case "clear":
            document.body.classList.add("weather-clear");
            break;

        case "clouds":
            document.body.classList.add("weather-clouds");
            break;

        case "rain":
        case "drizzle":
            document.body.classList.add("weather-rain");
            break;

        case "thunderstorm":
            document.body.classList.add("weather-storm");
            break;

        case "snow":
            document.body.classList.add("weather-snow");
            break;

        default:


            // GitHub contribution update
            document.body.classList.add("weather-default");
    }
}
