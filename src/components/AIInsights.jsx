import { motion } from "framer-motion";
import { AlertTriangle, Camera, Lightbulb, Sunrise, Sunset, Waves } from "lucide-react";

function InsightRow({ icon: Icon, text }) {
  return (
    <div className="glass-subtle flex items-start gap-3 rounded-2xl px-4 py-3">
      <Icon className="mt-0.5 h-4 w-4 text-sky-300" />
      <p className="text-sm leading-6 text-slate-200">{text}</p>
    </div>
  );
}

function AstroTile({ icon: Icon, label, value }) {
  return (
    <div className="glass-subtle rounded-[22px] p-4">
      <div className="flex items-center gap-2 text-slate-300">
        <Icon className="h-4 w-4 text-sky-300" />
        <span className="text-xs uppercase tracking-[0.26em] text-slate-400">{label}</span>
      </div>
      <p className="mt-3 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

export default function AIInsights({ insights, astronomy }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45 }}
      className="glass-panel rounded-[30px] p-6 shadow-glass"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">AI Weather Intel</p>
          <h2 className="section-title">Actionable insights from the next 24 hours</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-300">{insights.summary}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {insights.suggestions.map((suggestion) => (
          <span
            key={suggestion}
            className="rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-sm text-sky-100"
          >
            {suggestion}
          </span>
        ))}
      </div>

      <div className="mt-6 grid gap-3">
        {insights.highlights.map((highlight) => (
          <InsightRow key={highlight} icon={Lightbulb} text={highlight} />
        ))}
        {insights.alerts.map((alert) => (
          <InsightRow
            key={alert.headline}
            icon={AlertTriangle}
            text={`${alert.event || "Alert"}${alert.severity ? ` · ${alert.severity}` : ""} · ${alert.headline}`}
          />
        ))}
      </div>

      <div className="mt-8">
        <p className="section-kicker">Solar Window</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AstroTile icon={Sunrise} label="Sunrise" value={astronomy.sunrise} />
          <AstroTile icon={Sunset} label="Sunset" value={astronomy.sunset} />
          <AstroTile icon={Camera} label="Golden Hour AM" value={astronomy.goldenHour.morning} />
          <AstroTile icon={Waves} label="Golden Hour PM" value={astronomy.goldenHour.evening} />
        </div>
      </div>
    </motion.section>
  );
}

