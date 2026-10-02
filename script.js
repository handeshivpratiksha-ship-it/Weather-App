const API_KEY = "39674d78a870ac410b94cb5defdf8104";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

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
        return;
    }

    getWeather(city);
});


cityInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});


async function getWeather(city) {

    errorMessage.textContent = "";

    try {

        // Current weather
        const weatherURL =
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("City not found");
        }

        const weatherData = await weatherResponse.json();

        // Display current weather
        cityName.textContent =
            `${weatherData.name}, ${weatherData.sys.country}`;

        temperature.textContent =
            `${Math.round(weatherData.main.temp)}°C`;

        weatherCondition.textContent =
            weatherData.weather[0].description;

        humidity.textContent =
            `${weatherData.main.humidity}%`;

        wind.textContent =
            `${(weatherData.wind.speed * 3.6).toFixed(1)} km/h`;

        feelsLike.textContent =
            `${Math.round(weatherData.main.feels_like)}°C`;

        weatherIcon.textContent =
            getWeatherEmoji(weatherData.weather[0].main);

        // Get forecast
        getForecast(city);

    } catch (error) {

        errorMessage.textContent =
            "❌ City not found. Please try again.";

        cityName.textContent = "Search for a city";
        temperature.textContent = "--°C";
        weatherCondition.textContent = "---";
        humidity.textContent = "--%";
        wind.textContent = "-- km/h";
        feelsLike.textContent = "--°C";
        weatherIcon.textContent = "🌤️";

    }
}


async function getForecast(city) {

    try {

        const forecastURL =
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

        const response = await fetch(forecastURL);

        if (!response.ok) {
            throw new Error("Forecast unavailable");
        }

        const data = await response.json();

        forecast.innerHTML = "";

        // OpenWeather gives forecast every 3 hours.
        // We take one forecast approximately every 24 hours.
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

    } catch (error) {

        forecast.innerHTML =
            "<p>Forecast unavailable</p>";
    }
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