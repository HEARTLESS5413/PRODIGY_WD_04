import { motion } from "framer-motion";

const LABELS = [
  { label: "N", top: "8%", left: "50%" },
  { label: "E", top: "50%", left: "92%" },
  { label: "S", top: "92%", left: "50%" },
  { label: "W", top: "50%", left: "8%" },
];

export default function WindCompass({ degree, direction, speed }) {
  return (
    <section className="glass-panel rounded-[30px] p-6 shadow-glass">
      <p className="section-kicker">Wind Compass</p>
      <h2 className="section-title">Directional surface winds</h2>

      <div className="mt-6 flex items-center justify-center">
        <div className="relative h-64 w-64 rounded-full border border-white/10 bg-slate-950/30">
          <div className="absolute inset-4 rounded-full border border-dashed border-white/10" />
          <div className="absolute inset-[28%] rounded-full border border-white/10 bg-white/5" />

          {LABELS.map((entry) => (
            <span
              key={entry.label}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-xs font-semibold tracking-[0.28em] text-slate-400"
              style={{ top: entry.top, left: entry.left }}
            >
              {entry.label}
            </span>
          ))}

          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: degree }}
            transition={{ type: "spring", stiffness: 70, damping: 12 }}
            className="absolute left-1/2 top-1/2 h-[42%] w-1 -translate-x-1/2 -translate-y-full origin-bottom rounded-full bg-gradient-to-t from-sky-300/25 via-sky-300 to-cyan-100 shadow-[0_0_24px_rgba(125,211,252,0.45)]"
          >
            <div className="absolute -left-[7px] -top-3 h-4 w-4 rounded-full border border-white/20 bg-cyan-100" />
          </motion.div>

          <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-slate-950/90" />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="glass-subtle rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Bearing</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {degree}° {direction}
          </p>
        </div>
        <div className="glass-subtle rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Speed</p>
          <p className="mt-2 text-xl font-semibold text-white">{speed} km/h</p>
        </div>
      </div>
    </section>
  );
}
