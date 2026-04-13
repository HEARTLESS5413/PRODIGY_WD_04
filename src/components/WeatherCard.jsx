import { motion } from "framer-motion";
import {
  Compass,
  Droplets,
  Eye,
  Gauge,
  Sparkles,
  ThermometerSun,
  Wind,
} from "lucide-react";
import { convertTemp, formatTemp } from "../lib/weatherUtils";

function formatSyncTime(timestamp) {
  if (!timestamp) return "Just now";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function Metric({ icon: Icon, label, value, hint }) {
  return (
    <div className="metric-tile">
      <div className="flex items-center gap-2 text-slate-300">
        <Icon className="h-4 w-4 text-sky-300" />
        <span className="text-xs uppercase tracking-[0.28em] text-slate-400">{label}</span>
      </div>
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

export default function WeatherCard({ weatherData, lastSyncedAt, isRefreshing, unit, onToggleUnit }) {
  const { current, location, timeMeta, insights } = weatherData;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass-panel relative overflow-hidden rounded-[32px] p-6 shadow-glass sm:p-8"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/80 to-transparent" />

      <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-sky-200">
            <Sparkles className="h-3.5 w-3.5" />
            Smart Local Forecast
          </div>

          <div>
            <p className="text-sm text-slate-300">
              {location.name}
              {location.region ? `, ${location.region}` : ""} · {location.country}
            </p>
            <h1 className="font-display text-4xl font-semibold text-white sm:text-5xl">
              {convertTemp(current.temp, unit)}°{unit}
            </h1>
            <p className="mt-2 text-lg text-slate-200">{current.condition}</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{insights.summary}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1">
              Local time: {timeMeta.full}
            </span>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1">
              Updated {formatSyncTime(lastSyncedAt)}
            </span>
            {isRefreshing ? (
              <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-sky-100">
                Refreshing live data...
              </span>
            ) : null}
          </div>
        </div>

        <div className="glass-subtle flex items-center gap-4 rounded-[28px] p-4 sm:p-5">
          <img
            src={`https:${current.icon}`}
            alt={current.condition}
            className="h-20 w-20 drop-shadow-[0_10px_22px_rgba(125,211,252,0.35)]"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Feels Like</p>
            <p className="mt-1 text-2xl font-semibold text-white">{convertTemp(current.feelsLike, unit)}°{unit}</p>
            <p className="mt-2 text-xs text-slate-400">Visibility {current.visibilityKm} km</p>
          </div>
          <button
            type="button"
            onClick={onToggleUnit}
            className="ml-auto inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200 transition hover:bg-white/12"
            aria-label={`Switch to ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
          >
            <span className={unit === 'C' ? 'text-white' : 'text-slate-400'}>°C</span>
            <span className="text-slate-500">/</span>
            <span className={unit === 'F' ? 'text-white' : 'text-slate-400'}>°F</span>
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={ThermometerSun}
          label="Feels Like"
          value={formatTemp(current.feelsLike, unit)}
          hint="Ambient comfort index"
        />
        <Metric
          icon={Droplets}
          label="Humidity"
          value={`${current.humidity}%`}
          hint="Moisture in the air"
        />
        <Metric
          icon={Wind}
          label="Wind"
          value={`${current.windKph} km/h ${current.windDirection}`}
          hint="Real-time surface wind"
        />
        <Metric
          icon={Gauge}
          label="Pressure"
          value={`${current.pressureMb} mb`}
          hint="Barometric pressure"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Metric
          icon={Compass}
          label="Wind Bearing"
          value={`${current.windDegree}°`}
          hint="Compass heading"
        />
        <Metric
          icon={Eye}
          label="Visibility"
          value={`${current.visibilityKm} km`}
          hint="Clear-view distance"
        />
        <Metric
          icon={Sparkles}
          label="UV Index"
          value={current.uv.toFixed(1)}
          hint="Sun exposure intensity"
        />
      </div>
    </motion.section>
  );
}

