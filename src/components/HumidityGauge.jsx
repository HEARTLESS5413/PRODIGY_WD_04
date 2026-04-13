import { motion } from "framer-motion";

const SIZE = 176;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function HumidityGauge({ value }) {
  const progress = Math.min(Math.max(value, 0), 100);
  const dashOffset = CIRCUMFERENCE * (1 - progress / 100);

  return (
    <section className="glass-panel rounded-[30px] p-6 shadow-glass">
      <p className="section-kicker">Humidity Gauge</p>
      <h2 className="section-title">Animated moisture ring</h2>

      <div className="mt-6 flex items-center justify-center">
        <div className="relative">
          <svg width={SIZE} height={SIZE} className="-rotate-90 overflow-visible">
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="rgba(148, 163, 184, 0.18)"
              strokeWidth={STROKE}
              fill="transparent"
            />
            <motion.circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="url(#humidityGradient)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="humidityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7dd3fc" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-4xl font-semibold text-white">{progress}%</p>
            <p className="mt-2 text-xs uppercase tracking-[0.28em] text-slate-400">Current Humidity</p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-sm leading-6 text-slate-300">
        Higher readings usually mean the air feels heavier and warmer than the raw temperature suggests.
      </p>
    </section>
  );
}

