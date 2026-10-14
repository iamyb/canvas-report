import { cn } from "../../lib/utils.js";
import { Sparkline } from "./sparkline.jsx";

const tones = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

export function Stat({ label, value, delta, deltaLabel, hint, tone = "default", sparkline, sparklineColor, className }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs text-muted-foreground">{label}</div>
        {sparkline && <Sparkline data={sparkline} color={sparklineColor} width={72} height={24} />}
      </div>
      <div className={cn("mt-1 text-2xl font-semibold tabular-nums", tones[tone] || tones.default)}>
        {value}
      </div>
      {(delta !== undefined || hint) && (
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
          {delta !== undefined && (
            <span className={delta >= 0 ? "text-success" : "text-destructive"}>
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
            </span>
          )}
          {deltaLabel && <span className="text-muted-foreground">{deltaLabel}</span>}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </div>
  );
}
