const RAIN_KEYWORDS = ["rain", "drizzle", "shower"];
const SNOW_KEYWORDS = ["snow", "sleet", "ice", "blizzard"];
const STORM_KEYWORDS = ["thunder", "storm"];
const CLOUD_KEYWORDS = ["cloud", "overcast", "mist", "fog"];

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value) {
  return Math.round(toNumber(value));
}

/**
 * Convert a Celsius value to Fahrenheit when unit is 'F'.
 * Returns a rounded integer.
 */
export function convertTemp(celsius, unit = "C") {
  if (unit === "F") {
    return Math.round(celsius * 9 / 5 + 32);
  }
  return Math.round(celsius);
}

/**
 * Format a temperature with its unit suffix, e.g. "24°C" or "75°F".
 */
export function formatTemp(celsius, unit = "C") {
  return `${convertTemp(celsius, unit)}°${unit}`;
}

function formatWithTimeZone(epochSeconds, timeZone, options) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      ...options,
    }).format(new Date(epochSeconds * 1000));
  } catch {
    return new Intl.DateTimeFormat("en-US", options).format(new Date(epochSeconds * 1000));
  }
}

function humanizeDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getWindDirectionLabel(degrees = 0) {
  const normalized = ((degrees % 360) + 360) % 360;
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(normalized / 45) % 8];
}

export function getWeatherKind(conditionText = "") {
  const condition = conditionText.toLowerCase();

  if (STORM_KEYWORDS.some((keyword) => condition.includes(keyword))) return "storm";
  if (RAIN_KEYWORDS.some((keyword) => condition.includes(keyword))) return "rain";
  if (SNOW_KEYWORDS.some((keyword) => condition.includes(keyword))) return "snow";
  if (CLOUD_KEYWORDS.some((keyword) => condition.includes(keyword))) return "clouds";
  return "clear";
}

export function getBackgroundTheme(conditionText, isDay) {
  const kind = getWeatherKind(conditionText);

  if (!isDay && (kind === "clear" || kind === "clouds")) {
    return "night";
  }

  return kind;
}

function parseHumanTime(humanTime, baseDate) {
  const [time, period] = humanTime.trim().split(" ");
  const [hoursRaw, minutesRaw] = time.split(":").map(Number);
  let hours = hoursRaw % 12;

  if (period?.toUpperCase() === "PM") {
    hours += 12;
  }

  const date = new Date(baseDate);
  date.setHours(hours, minutesRaw, 0, 0);
  return date;
}

function formatHumanTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getGoldenHour(sunrise, sunset, baseDate) {
  const sunriseDate = parseHumanTime(sunrise, baseDate);
  const sunsetDate = parseHumanTime(sunset, baseDate);

  const morningEnd = new Date(sunriseDate.getTime() + 60 * 60 * 1000);
  const eveningStart = new Date(sunsetDate.getTime() - 60 * 60 * 1000);

  return {
    morning: `${formatHumanTime(sunriseDate)} - ${formatHumanTime(morningEnd)}`,
    evening: `${formatHumanTime(eveningStart)} - ${formatHumanTime(sunsetDate)}`,
  };
}

export function getCurrentTimeMeta(location) {
  const localtimeEpoch = location.localtime_epoch;
  const timeZone = location.tz_id;

  return {
    full: formatWithTimeZone(localtimeEpoch, timeZone, {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    shortDay: formatWithTimeZone(localtimeEpoch, timeZone, {
      weekday: "short",
    }),
    timeOnly: formatWithTimeZone(localtimeEpoch, timeZone, {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

function buildHourlyForecast(payload) {
  const currentEpoch = payload.current.last_updated_epoch;
  const timeZone = payload.location.tz_id;

  const flattenedHours = payload.forecast.forecastday.flatMap((day) => day.hour);
  const startIndex = Math.max(
    0,
    flattenedHours.findIndex((hour) => hour.time_epoch >= currentEpoch)
  );

  return flattenedHours.slice(startIndex, startIndex + 24).map((hour) => ({
    id: hour.time_epoch,
    timeEpoch: hour.time_epoch,
    label: formatWithTimeZone(hour.time_epoch, timeZone, {
      hour: "numeric",
    }),
    longLabel: formatWithTimeZone(hour.time_epoch, timeZone, {
      hour: "numeric",
      minute: "2-digit",
    }),
    temp: round(hour.temp_c),
    feelsLike: round(hour.feelslike_c),
    humidity: round(hour.humidity),
    rainChance: round(hour.chance_of_rain),
    snowChance: round(hour.chance_of_snow),
    windKph: round(hour.wind_kph),
    condition: hour.condition.text,
    icon: hour.condition.icon,
    isDay: Boolean(hour.is_day),
  }));
}

function buildWeeklyForecast(payload) {
  const timeZone = payload.location.tz_id;

  return payload.forecast.forecastday.slice(0, 7).map((day) => ({
    id: day.date_epoch,
    date: day.date,
    dayLabel: formatWithTimeZone(day.date_epoch, timeZone, {
      weekday: "short",
    }),
    fullLabel: humanizeDate(day.date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    }),
    max: round(day.day.maxtemp_c),
    min: round(day.day.mintemp_c),
    avgHumidity: round(day.day.avghumidity),
    rainChance: round(day.day.daily_chance_of_rain),
    condition: day.day.condition.text,
    icon: day.day.condition.icon,
  }));
}

function createSummary(current, hourly, daily) {
  const nextRainIndex = hourly.findIndex(
    (hour) => hour.rainChance >= 55 || getWeatherKind(hour.condition) === "rain"
  );
  const windyHour = hourly.slice(0, 8).find((hour) => hour.windKph >= 35);
  const maxTemp = Math.max(...hourly.map((hour) => hour.temp));
  const minTemp = Math.min(...hourly.map((hour) => hour.temp));
  const temperatureSwing = maxTemp - minTemp;

  if (nextRainIndex === 0) {
    return "Rain is active right now, so keep cover nearby.";
  }

  if (nextRainIndex > 0 && nextRainIndex <= 2) {
    return `Rain is likely within the next ${nextRainIndex + 1} hours.`;
  }

  if (windyHour) {
    return `Wind strengthens later, peaking near ${windyHour.windKph} km/h.`;
  }

  if (temperatureSwing >= 8) {
    return `Expect a noticeable ${temperatureSwing}°C temperature swing over the next day.`;
  }

  if (current.temp >= 30 || daily[0]?.max >= 32) {
    return "Heat stays elevated today, with the warmest stretch arriving in the afternoon.";
  }

  return "Conditions stay fairly stable through the next 24 hours.";
}

function createSuggestions(current, hourly, daily) {
  const nextRain = hourly.find((hour) => hour.rainChance >= 55);
  const highWind = hourly.find((hour) => hour.windKph >= 35);
  const pleasant =
    !nextRain &&
    current.temp >= 18 &&
    current.temp <= 27 &&
    daily[0]?.rainChance < 35 &&
    current.windKph < 20;
  const suggestions = [];

  if (nextRain) {
    suggestions.push("Carry an umbrella ☔");
  }

  if (current.temp >= 30 || daily[0]?.max >= 32) {
    suggestions.push("Stay hydrated and seek shade during peak heat 💧");
  }

  if (current.temp <= 12 || daily[0]?.min <= 10) {
    suggestions.push("A light jacket will feel better once temperatures dip 🧥");
  }

  if (highWind) {
    suggestions.push("Secure loose items and expect breezier travel conditions 🌬️");
  }

  if (pleasant) {
    suggestions.push("Great window for an outdoor workout or walk 💪");
  }

  return suggestions.slice(0, 4);
}

function createHighlights(current, hourly) {
  const rainWindow = hourly.find(
    (hour) => hour.rainChance >= 55 || getWeatherKind(hour.condition) === "rain"
  );
  const hottestHour = [...hourly].sort((a, b) => b.temp - a.temp)[0];
  const calmHour = [...hourly].sort((a, b) => a.windKph - b.windKph)[0];

  return [
    rainWindow
      ? `Wettest window: ${rainWindow.longLabel} with ${rainWindow.rainChance}% rain chance.`
      : "No major rain signal across the next 24 hours.",
    hottestHour
      ? `Warmest point: ${hottestHour.temp}°C near ${hottestHour.longLabel}.`
      : "No major heat spike detected.",
    calmHour
      ? `Calmest stretch: ${calmHour.longLabel} around ${calmHour.windKph} km/h winds.`
      : `Current breeze holds near ${current.windKph} km/h.`,
  ];
}

export function generateInsights(current, hourly, daily, alerts = []) {
  return {
    summary: createSummary(current, hourly, daily),
    suggestions: createSuggestions(current, hourly, daily),
    highlights: createHighlights(current, hourly),
    alerts: alerts.map((alert) => ({
      headline: alert.headline,
      severity: alert.severity,
      event: alert.event,
    })),
  };
}

export function normalizeWeatherData(payload) {
  const primaryForecastDay = payload.forecast.forecastday[0];
  const baseDate = humanizeDate(primaryForecastDay.date);
  const hourly = buildHourlyForecast(payload);
  const daily = buildWeeklyForecast(payload);
  const current = {
    temp: round(payload.current.temp_c),
    feelsLike: round(payload.current.feelslike_c),
    humidity: round(payload.current.humidity),
    windKph: round(payload.current.wind_kph),
    windDegree: round(payload.current.wind_degree),
    windDirection: getWindDirectionLabel(payload.current.wind_degree),
    pressureMb: round(payload.current.pressure_mb),
    uv: toNumber(payload.current.uv),
    visibilityKm: round(payload.current.vis_km),
    precipitationMm: toNumber(payload.current.precip_mm),
    condition: payload.current.condition.text,
    icon: payload.current.condition.icon,
    isDay: Boolean(payload.current.is_day),
    code: payload.current.condition.code,
  };

  const astronomy = {
    sunrise: primaryForecastDay.astro.sunrise,
    sunset: primaryForecastDay.astro.sunset,
    moonrise: primaryForecastDay.astro.moonrise,
    moonset: primaryForecastDay.astro.moonset,
    goldenHour: getGoldenHour(
      primaryForecastDay.astro.sunrise,
      primaryForecastDay.astro.sunset,
      baseDate
    ),
  };

  const location = {
    name: payload.location.name,
    region: payload.location.region,
    country: payload.location.country,
    localtime: payload.location.localtime,
    localtimeEpoch: payload.location.localtime_epoch,
    timeZone: payload.location.tz_id,
    lat: payload.location.lat,
    lon: payload.location.lon,
  };

  return {
    location,
    current,
    hourly,
    daily,
    astronomy,
    timeMeta: getCurrentTimeMeta(payload.location),
    insights: generateInsights(current, hourly, daily, payload.alerts?.alert ?? []),
    theme: getBackgroundTheme(current.condition, current.isDay),
  };
}
