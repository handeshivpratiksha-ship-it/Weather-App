export default async function handler(req, res) {
    const city = req.query.city;

    if (!city) {
        return res.status(400).json({ error: "City is required" });
    }

    const API_KEY = process.env.OPENWEATHER_API_KEY;

    try {
        const weatherURL =
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const forecastURL =
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(weatherURL),
            fetch(forecastURL)
        ]);

        const weather = await weatherResponse.json();
        const forecast = await forecastResponse.json();

        if (!weatherResponse.ok) {
            return res.status(weatherResponse.status).json({
                error: weather.message || "City not found"
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