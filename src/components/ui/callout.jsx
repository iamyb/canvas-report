import { cn } from "../../lib/utils.js";

// Highlighted callout block: key conclusions / risks / recommendations, more prominent than a bare Card
// tone: info (default) | success | warning | danger
const tones = {
  info: {
    box: "border-l-primary bg-primary/5",
    title: "text-foreground",
    icon: "text-primary",
  },
  success: {
    box: "border-l-success bg-success/5",
    title: "text-foreground",
    icon: "text-success",
  },
  warning: {
    box: "border-l-warning bg-warning/5",
    title: "text-foreground",
    icon: "text-warning",
  },
  danger: {
    box: "border-l-destructive bg-destructive/5",
    title: "text-foreground",
    icon: "text-destructive",
  },
};

const icons = {
  info: "ℹ",
  success: "✓",
  warning: "⚠",
  danger: "✕",
};

export function Callout({ tone = "info", title, children, className }) {
  const t = tones[tone] || tones.info;
  return (
    <div className={cn("rounded-xl border border-border border-l-4 p-4", t.box, className)}>
      {title && (
        <div className={cn("flex items-center gap-2 text-sm font-semibold", t.title)}>
          <span className={cn("text-xs", t.icon)} aria-hidden>
            {icons[tone] || icons.info}
          </span>
          {title}
        </div>
      )}
      <div className={cn("text-sm leading-relaxed text-muted-foreground", title && "mt-1.5")}>
        {children}
      </div>
    </div>
  );
}
