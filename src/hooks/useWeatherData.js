import { useEffect, useState } from "react";
import { fetchForecastByCity, fetchForecastByCoords, fetchLocationByIp } from "../lib/weatherApi";
import {
  loadLastCoords,
  loadLastQuery,
  loadLastSource,
  loadWeatherSnapshot,
  saveLastCoords,
  saveLastQuery,
  saveWeatherSnapshot,
} from "../lib/storage";
import { normalizeWeatherData } from "../lib/weatherUtils";

const AUTO_REFRESH_MS = 12 * 60 * 1000;
const HAS_API_KEY = Boolean(import.meta.env.VITE_WEATHER_API_KEY?.trim());

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported on this device."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

export function useWeatherData() {
  const snapshot = loadWeatherSnapshot();
  const [weatherData, setWeatherData] = useState(snapshot?.data ?? null);
  const [status, setStatus] = useState(snapshot?.data ? "ready" : "loading");
  const [error, setError] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("Loading weather...");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(snapshot?.savedAt ?? null);

  async function resolveForecast(request, options = {}) {
    const {
      loadingState = "Loading weather...",
      silent = false,
      query,
      coords,
      staleErrorMessage = "Unable to refresh right now. Showing the last saved forecast.",
    } = options;

    setError("");

    if (silent && weatherData) {
      setIsRefreshing(true);
    } else {
      setLoadingMessage(loadingState);
      setStatus("loading");
    }

    try {
      const payload = await request;
      const normalized = normalizeWeatherData(payload);

      setWeatherData(normalized);
      setStatus("ready");
      setLastSyncedAt(Date.now());
      saveWeatherSnapshot(normalized);

      if (query) {
        saveLastQuery(query);
      }

      if (coords) {
        saveLastCoords(coords);
      }

      return normalized;
    } catch (requestError) {
      if (!weatherData) {
        setStatus("error");
        setError(requestError.message);
      } else {
        setStatus("ready");
        setError(silent ? staleErrorMessage : requestError.message);
      }

      throw requestError;
    } finally {
      setIsRefreshing(false);
    }
  }

  async function searchCity(query, options = {}) {
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      return null;
    }

    return resolveForecast(fetchForecastByCity(cleanQuery), {
      loadingState: `Searching for ${cleanQuery}...`,
      query: cleanQuery,
      ...options,
    });
  }

  async function fetchByCoords(coords, options = {}) {
    return resolveForecast(fetchForecastByCoords(coords), {
      loadingState: "Refreshing your location...",
      coords,
      ...options,
    });
  }

  async function refreshLocation(options = {}) {
    try {
      const position = await getCurrentPosition();
      return fetchByCoords(
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        options
      );
    } catch (locationError) {
      // Fallback: try IP-based location detection before giving up
      try {
        const ipCoords = await fetchLocationByIp();
        return fetchByCoords(ipCoords, {
          ...options,
          loadingState: "Detecting location from your IP address...",
        });
      } catch {
        // IP fallback also failed — show manual search message
        const message =
          locationError.code === 1
            ? "Location access was denied and IP detection failed. Search for a city manually."
            : "We couldn't detect your location. Search for a city or try again.";

        if (!weatherData) {
          setStatus("error");
        }

        setError(message);
        throw locationError;
      }
    }
  }


  async function refreshActiveSource(options = {}) {
    const lastSource = loadLastSource();
    const lastCoords = loadLastCoords();
    const lastQuery = loadLastQuery();

    if (lastSource === "coords" && lastCoords) {
      return fetchByCoords(lastCoords, {
        silent: true,
        ...options,
      });
    }

    if (lastQuery) {
      return searchCity(lastQuery, {
        silent: true,
        ...options,
      });
    }

    return refreshLocation({
      silent: true,
      ...options,
    });
  }

  useEffect(() => {
    if (!HAS_API_KEY) {
      setStatus(weatherData ? "ready" : "error");
      setError("Add VITE_WEATHER_API_KEY to your .env file to unlock live forecasts.");
      return;
    }

    const lastSource = loadLastSource();
    const lastCoords = loadLastCoords();
    const lastQuery = loadLastQuery();
    const silentBootstrap = Boolean(snapshot?.data);

    if (lastSource === "coords" && lastCoords) {
      fetchByCoords(lastCoords, { silent: silentBootstrap }).catch(() => {});
      return;
    }

    if (lastQuery) {
      searchCity(lastQuery, { silent: silentBootstrap }).catch(() => {});
      return;
    }

    refreshLocation({ silent: silentBootstrap }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!HAS_API_KEY || !weatherData) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      refreshActiveSource({
        staleErrorMessage: "Auto-refresh missed a cycle, so the latest saved forecast is still on screen.",
      }).catch(() => {});
    }, AUTO_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [weatherData]);

  return {
    weatherData,
    status,
    error,
    isRefreshing,
    lastSyncedAt,
    loadingMessage,
    hasApiKey: HAS_API_KEY,
    searchCity,
    refreshLocation,
    refreshActiveSource,
  };
}
