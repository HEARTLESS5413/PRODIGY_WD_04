import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, LoaderCircle, Radar, Sparkles, Waves } from "lucide-react";
import AIInsights from "./components/AIInsights";
import BackgroundManager from "./components/BackgroundManager";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import { useWeatherData } from "./hooks/useWeatherData";
import { loadTempUnit, saveTempUnit } from "./lib/storage";
import { convertTemp } from "./lib/weatherUtils";

const HourlyChart = lazy(() => import("./components/HourlyChart"));
const WeeklyChart = lazy(() => import("./components/WeeklyChart"));
const HumidityGauge = lazy(() => import("./components/HumidityGauge"));
const WindCompass = lazy(() => import("./components/WindCompass"));

const TABS = [
  { id: "today", label: "Today" },
  { id: "hourly", label: "Hourly" },
  { id: "weekly", label: "Weekly" },
];

function vibrate() {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(14);
  }
}

function PanelFallback() {
  return (
    <div className="glass-panel flex min-h-[320px] items-center justify-center rounded-[30px] p-6 shadow-glass">
      <div className="flex items-center gap-3 text-slate-300">
        <LoaderCircle className="h-5 w-5 animate-spin text-sky-300" />
        <span>Rendering weather visualizations...</span>
      </div>
    </div>
  );
}

function LoadingShell({ message }) {
  return (
    <section className="glass-panel rounded-[32px] p-8 shadow-glass">
      <div className="flex items-center gap-3 text-slate-200">
        <LoaderCircle className="h-5 w-5 animate-spin text-sky-300" />
        <p>{message}</p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="skeleton-card h-64" />
        <div className="skeleton-card h-64" />
      </div>
    </section>
  );
}

function EmptyState({ message, hasApiKey }) {
  return (
    <section className="glass-panel rounded-[32px] p-8 shadow-glass">
      <div className="max-w-2xl">
        <p className="section-kicker">Setup Ready</p>
        <h2 className="section-title">Atmos AI is waiting for live weather data</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">{message}</p>
        {!hasApiKey ? (
          <div className="glass-subtle mt-6 rounded-2xl p-4 text-sm text-slate-200">
            Add `VITE_WEATHER_API_KEY` to `.env`, restart the dev server, and the full live dashboard will load automatically.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ForecastStrip({ daily, unit }) {
  return (
    <section className="glass-panel rounded-[30px] p-6 shadow-glass">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="section-kicker">Weekly Snapshot</p>
          <h2 className="section-title">Day-by-day outlook cards</h2>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-400 sm:flex">
          <Waves className="h-4 w-4 text-sky-300" />
          Mobile scroll ready
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {daily.map((day) => (
          <div key={day.id} className="glass-subtle rounded-[24px] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{day.dayLabel}</p>
                <p className="mt-1 text-xs text-slate-400">{day.fullLabel}</p>
              </div>
              <img src={`https:${day.icon}`} alt={day.condition} className="h-11 w-11" />
            </div>
            <p className="mt-3 text-sm text-slate-300">{day.condition}</p>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-lg font-semibold text-white">{convertTemp(day.max, unit)}°{unit}</p>
              <p className="text-sm text-slate-400">{convertTemp(day.min, unit)}°{unit}</p>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-400">
              Rain {day.rainChance}% · Humidity {day.avgHumidity}%
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const {
    weatherData,
    status,
    error,
    isRefreshing,
    lastSyncedAt,
    loadingMessage,
    hasApiKey,
    searchCity,
    refreshLocation,
    refreshActiveSource,
  } = useWeatherData();

  const [activeTab, setActiveTab] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [unit, setUnit] = useState(() => loadTempUnit());
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(min-width: 1280px)").matches
  );

  function toggleUnit() {
    const next = unit === "C" ? "F" : "C";
    setUnit(next);
    saveTempUnit(next);
    vibrate();
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1280px)");

    function syncLayout(event) {
      setIsDesktop(event.matches);
    }

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener("change", syncLayout);

    return () => {
      mediaQuery.removeEventListener("change", syncLayout);
    };
  }, []);

  function changeTab(nextIndex) {
    const boundedIndex = Math.max(0, Math.min(TABS.length - 1, nextIndex));
    setActiveTab(boundedIndex);
    vibrate();
  }

  function renderMobilePanel() {
    if (!weatherData) return null;

    const panel = TABS[activeTab].id;

    if (panel === "today") {
      return (
        <div className="grid gap-6">
          <Suspense fallback={<PanelFallback />}>
            <HumidityGauge value={weatherData.current.humidity} />
          </Suspense>
          <Suspense fallback={<PanelFallback />}>
            <WindCompass
              degree={weatherData.current.windDegree}
              direction={weatherData.current.windDirection}
              speed={weatherData.current.windKph}
            />
          </Suspense>
        </div>
      );
    }

    if (panel === "hourly") {
      return (
        <Suspense fallback={<PanelFallback />}>
          <HourlyChart data={weatherData.hourly} unit={unit} />
        </Suspense>
      );
    }

    return (
      <div className="grid gap-6">
        <Suspense fallback={<PanelFallback />}>
          <WeeklyChart data={weatherData.daily} unit={unit} />
        </Suspense>
        <ForecastStrip daily={weatherData.daily} unit={unit} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <BackgroundManager theme={weatherData?.theme ?? "night"} />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="glass-panel rounded-[32px] p-6 shadow-glass sm:p-8"
        >
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-sky-100">
                <Sparkles className="h-3.5 w-3.5 text-sky-300" />
                Immersive Weather Intelligence
              </div>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Premium forecasting with live sky visuals, AI-style guidance, and mobile-first charts.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Auto-detect location, search anywhere, analyze the next 24 hours intelligently, and watch the background respond in real time to the forecast.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.28em] text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">
                Auto-refresh every 12 min
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">
                Swipe ready on mobile
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">
                Glassmorphism dark UI
              </span>
            </div>
          </div>

          <div className="mt-6">
            <SearchBar
              onSearch={searchCity}
              onUseLocation={refreshLocation}
              onRefresh={refreshActiveSource}
              isRefreshing={isRefreshing}
              disabled={!hasApiKey}
            />
          </div>
        </motion.header>

        {error && weatherData ? (
          <div className="glass-panel flex items-start gap-3 rounded-[24px] border border-amber-300/18 bg-amber-300/8 p-4 text-sm text-amber-50 shadow-soft">
            <AlertCircle className="mt-0.5 h-4 w-4 text-amber-200" />
            <span>{error}</span>
          </div>
        ) : null}

        {!weatherData && status === "loading" ? <LoadingShell message={loadingMessage} /> : null}
        {!weatherData && status === "error" ? (
          <EmptyState message={error} hasApiKey={hasApiKey} />
        ) : null}

        {weatherData ? (
          <>
            <WeatherCard
              weatherData={weatherData}
              lastSyncedAt={lastSyncedAt}
              isRefreshing={isRefreshing}
              unit={unit}
              onToggleUnit={toggleUnit}
            />

            <AIInsights insights={weatherData.insights} astronomy={weatherData.astronomy} />

            {isDesktop ? (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)]">
                <div className="space-y-6">
                  <Suspense fallback={<PanelFallback />}>
                    <HourlyChart data={weatherData.hourly} unit={unit} />
                  </Suspense>
                  <Suspense fallback={<PanelFallback />}>
                    <WeeklyChart data={weatherData.daily} unit={unit} />
                  </Suspense>
                  <ForecastStrip daily={weatherData.daily} unit={unit} />
                </div>

                <div className="space-y-6">
                  <Suspense fallback={<PanelFallback />}>
                    <HumidityGauge value={weatherData.current.humidity} />
                  </Suspense>
                  <Suspense fallback={<PanelFallback />}>
                    <WindCompass
                      degree={weatherData.current.windDegree}
                      direction={weatherData.current.windDirection}
                      speed={weatherData.current.windKph}
                    />
                  </Suspense>
                </div>
              </div>
            ) : (
              <section className="space-y-4">
                <div className="glass-panel flex items-center gap-2 overflow-x-auto rounded-[28px] p-2 shadow-glass">
                  {TABS.map((tab, index) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => changeTab(index)}
                      className={`min-w-[120px] rounded-[22px] px-4 py-3 text-sm font-semibold transition ${
                        activeTab === index
                          ? "bg-sky-300 text-slate-950"
                          : "bg-transparent text-slate-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div
                  onTouchStart={(event) => setTouchStartX(event.changedTouches[0].clientX)}
                  onTouchEnd={(event) => {
                    if (touchStartX === null) return;
                    const delta = event.changedTouches[0].clientX - touchStartX;
                    if (Math.abs(delta) > 55) {
                      changeTab(activeTab + (delta < 0 ? 1 : -1));
                    }
                    setTouchStartX(null);
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={TABS[activeTab].id}
                      initial={{ opacity: 0, x: 36 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -36 }}
                      transition={{ duration: 0.22 }}
                    >
                      {renderMobilePanel()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </section>
            )}

            <footer className="pb-4 text-center text-xs uppercase tracking-[0.28em] text-slate-400">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2">
                <Radar className="h-4 w-4 text-sky-300" />
                Forecast visualizations optimized for mobile and desktop
              </div>
            </footer>
          </>
        ) : null}
      </div>
    </div>
  );
}
