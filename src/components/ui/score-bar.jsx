import { cn } from "../../lib/utils.js";

// Percentage with a colored bar: auto-colored by threshold (meets target = green / warning = yellow / below target = red)
// good / warn are the thresholds: >= good green, >= warn yellow, otherwise red; defaults to 80 / 60 when omitted
// value may exceed 100 (e.g. NRR 118%): the original value is displayed, bar width is clamped to 0~100
export function ScoreBar({ label, value = 0, good = 80, warn = 60, suffix = "%", className }) {
  const v = Number(value) || 0;
  const width = Math.min(100, Math.max(0, v));
  const tone = v >= good ? "bg-success" : v >= warn ? "bg-warning" : "bg-destructive";
  const text = v >= good ? "text-success" : v >= warn ? "text-warning" : "text-destructive";
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        {label !== undefined && <span className="text-muted-foreground">{label}</span>}
        <span className={cn("font-semibold tabular-nums", text)}>
          {v}
          {suffix}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
