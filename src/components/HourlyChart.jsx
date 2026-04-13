import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { convertTemp } from "../lib/weatherUtils";

function HourlyTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;

  const temp = payload.find((entry) => entry.dataKey === "temp");
  const feelsLike = payload.find((entry) => entry.dataKey === "feelsLike");
  const humidity = payload[0]?.payload?.humidity;
  const rainChance = payload[0]?.payload?.rainChance;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="mt-2 text-sm text-slate-200">Actual: {temp?.value}°{unit}</p>
      <p className="text-sm text-slate-300">Feels like: {feelsLike?.value}°{unit}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">
        Humidity {humidity}% · Rain {rainChance}%
      </p>
    </div>
  );
}

export default function HourlyChart({ data, unit }) {
  const chartData = data.map((entry) => ({
    ...entry,
    temp: convertTemp(entry.temp, unit),
    feelsLike: convertTemp(entry.feelsLike, unit),
  }));
  const minWidth = Math.max(760, chartData.length * 54);

  return (
    <section className="glass-panel rounded-[30px] p-6 shadow-glass">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">24 Hour Forecast</p>
          <h2 className="section-title">Temperature curve with feels-like comparison</h2>
        </div>
        <p className="text-sm leading-6 text-slate-300">
          Hover or drag across the line to inspect comfort shifts, humidity, and rain chance.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div style={{ minWidth, height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 12, right: 16, bottom: 0, left: -12 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.14)" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                width={42}
                domain={[(min) => min - 2, (max) => max + 2]}
              />
              <Tooltip content={<HourlyTooltip unit={unit} />} cursor={{ stroke: "rgba(125,211,252,0.35)" }} />
              <Legend wrapperStyle={{ color: "#cbd5e1", paddingTop: 14 }} />
              <Line
                type="monotone"
                dataKey="temp"
                name="Actual temp"
                stroke="#7dd3fc"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0, fill: "#f8fafc" }}
                isAnimationActive
              />
              <Line
                type="monotone"
                dataKey="feelsLike"
                name="Feels like"
                stroke="#fca5a5"
                strokeWidth={2.5}
                strokeDasharray="6 6"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: "#fca5a5" }}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

