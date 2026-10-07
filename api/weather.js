export default async function handler(req, res) {
    const { city, lat, lon } = req.query;

    if (!city && (!lat || !lon)) {
        return res.status(400).json({
            error: "City or location is required"
        });
    }

    const API_KEY = process.env.OPENWEATHER_API_KEY;

    try {
        let weatherURL;
        let forecastURL;

        if (lat && lon) {
            weatherURL =
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

            forecastURL =
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        } else {
            weatherURL =
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

            forecastURL =
                `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        }

        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(weatherURL),
            fetch(forecastURL)
        ]);

        const weather = await weatherResponse.json();
        const forecast = await forecastResponse.json();

        if (!weatherResponse.ok) {
            return res.status(weatherResponse.status).json({
                error: weather.message || "Location not found"
            });
        }

        return res.status(200).json({
            weather,
            forecast
        });

    } catch (error) {
        return res.status(500).json({
            error: "Unable to fetch weather"
        });
    }
}