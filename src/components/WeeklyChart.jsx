import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { convertTemp } from "../lib/weatherUtils";

function WeeklyTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;

  const min = payload.find((entry) => entry.dataKey === "min");
  const max = payload.find((entry) => entry.dataKey === "max");
  const avg = payload.find((entry) => entry.dataKey === "avg");
  const rain = payload[0]?.payload?.rainChance;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="mt-2 text-sm text-slate-200">Min: {min?.value}°{unit}</p>
      <p className="text-sm text-slate-200">Max: {max?.value}°{unit}</p>
      <p className="text-sm text-slate-300">Trend: {avg?.value}°{unit} avg</p>
      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">
        Rain chance {rain}%
      </p>
    </div>
  );
}

export default function WeeklyChart({ data, unit }) {
  const chartData = data.map((entry) => ({
    ...entry,
    min: convertTemp(entry.min, unit),
    max: convertTemp(entry.max, unit),
    avg: Math.round((convertTemp(entry.max, unit) + convertTemp(entry.min, unit)) / 2),
  }));
  const minWidth = Math.max(620, data.length * 84);

  return (
    <section className="glass-panel rounded-[30px] p-6 shadow-glass">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">7 Day Trend</p>
          <h2 className="section-title">Weekly min and max temperature outlook</h2>
        </div>
        <p className="text-sm leading-6 text-slate-300">
          Compare daily extremes quickly and spot the warmer or cooler windows for the week ahead.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div style={{ minWidth, height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 16, bottom: 0, left: -12 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.14)" vertical={false} />
              <XAxis
                dataKey="dayLabel"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                width={42}
                domain={[(min) => min - 3, (max) => max + 3]}
              />
              <Tooltip content={<WeeklyTooltip unit={unit} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Legend wrapperStyle={{ color: "#cbd5e1", paddingTop: 14 }} />
              <Bar
                dataKey="min"
                name="Min temp"
                fill="rgba(96, 165, 250, 0.82)"
                radius={[12, 12, 0, 0]}
                barSize={22}
              />
              <Bar
                dataKey="max"
                name="Max temp"
                fill="rgba(34, 211, 238, 0.9)"
                radius={[12, 12, 0, 0]}
                barSize={22}
              />
              <Line
                type="monotone"
                dataKey="avg"
                name="Avg trend"
                stroke="#f8fafc"
                strokeWidth={2}
                dot={{ r: 3, fill: "#f8fafc" }}
                activeDot={{ r: 5, fill: "#f8fafc" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
