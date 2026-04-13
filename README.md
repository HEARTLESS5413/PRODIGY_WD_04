# Atmos AI Weather

A premium, mobile-first weather web application built with React, Tailwind CSS, Framer Motion, Canvas API, and Recharts. The interface combines glassmorphism, adaptive animated backgrounds, smart weather suggestions, swipeable mobile panels, and chart-driven forecast views.

## Features

- Auto-detects the user's location with manual city search fallback
- Current weather, 24-hour outlook, and 7-day trend views
- AI-style smart summaries and suggestions generated from hourly forecast logic
- Dynamic live sky visuals for clear, rain, snow, storm, clouds, and night states
- Feels-like vs actual temperature chart, humidity gauge, and wind direction compass
- Sunrise, sunset, and golden-hour timing cards
- Auto-refresh every 12 minutes with local cache for the last successful forecast
- Mobile-first layout with swipe navigation and lightweight PWA support

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file from `.env.example`:

```bash
VITE_WEATHER_API_KEY=your_weatherapi_key_here
```

3. Start the app:

```bash
npm run dev
```

4. Open the local Vite URL shown in the terminal.

## API Key

This project uses [WeatherAPI](https://www.weatherapi.com/) for 7-day forecasts, hourly data, location search, and astronomy details. It fits the requested "OpenWeatherMap or similar" requirement while keeping the integration simple and reliable for all required views.

If you prefer OpenWeatherMap, the API adapter is isolated in `src/lib/weatherApi.js`, so you can swap providers without redesigning the UI.

## Project Structure

```text
src/
  components/
    AIInsights.jsx
    BackgroundManager.jsx
    HourlyChart.jsx
    HumidityGauge.jsx
    SearchBar.jsx
    WeatherCard.jsx
    WeeklyChart.jsx
    WindCompass.jsx
  hooks/
    useWeatherData.js
  lib/
    registerPwa.js
    storage.js
    weatherApi.js
    weatherUtils.js
  App.jsx
  index.css
  main.jsx
```

## Notes

- The last successful forecast and source are cached in `localStorage`.
- The service worker is intentionally lightweight and only registers in production builds.
- Mobile swipe navigation switches between the Today, Hourly, and Weekly panes.
