const BASE_URL = "https://api.weatherapi.com/v1";

function getApiKey() {
  return import.meta.env.VITE_WEATHER_API_KEY?.trim();
}

function buildUrl(path, params) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("Missing API key. Add VITE_WEATHER_API_KEY to your .env file.");
  }

  const url = new URL(`${BASE_URL}/${path}`);
  url.searchParams.set("key", apiKey);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function request(path, params = {}) {
  const response = await fetch(buildUrl(path, params));
  const payload = await response.json();

  if (!response.ok || payload.error) {
    const message =
      payload?.error?.message ||
      "Weather service is temporarily unavailable. Please try again.";
    throw new Error(message);
  }

  return payload;
}

export async function fetchForecastByCoords({ latitude, longitude }) {
  return request("forecast.json", {
    q: `${latitude},${longitude}`,
    days: 7,
    aqi: "no",
    alerts: "yes",
  });
}

export async function fetchForecastByCity(query) {
  return request("forecast.json", {
    q: query,
    days: 7,
    aqi: "no",
    alerts: "yes",
  });
}

export async function searchLocations(query) {
  const cleanQuery = query.trim();

  if (cleanQuery.length < 2) {
    return [];
  }

  return request("search.json", {
    q: cleanQuery,
  });
}

/**
 * Fallback location detection using the user's IP address.
 * Uses ipapi.co (free, no key required).
 * Returns { latitude, longitude } or throws on failure.
 */
export async function fetchLocationByIp() {
  const response = await fetch("https://ipapi.co/json/", {
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error("IP-based location detection failed.");
  }

  const data = await response.json();

  if (!data.latitude || !data.longitude) {
    throw new Error("IP geolocation returned incomplete data.");
  }

  return {
    latitude: data.latitude,
    longitude: data.longitude,
  };
}

