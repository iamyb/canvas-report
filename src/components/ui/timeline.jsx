import { cn } from "../../lib/utils.js";

export function Timeline({ items = [], className }) {
  return (
    <ol className={cn("relative ml-1.5 space-y-4 border-l border-border pl-5", className)}>
      {items.map((it, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[26.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
          {it.date && <div className="text-xs tabular-nums text-muted-foreground">{it.date}</div>}
          <div className="text-sm font-medium">{it.title}</div>
          {it.description && (
            <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{it.description}</div>
          )}
        </li>
      ))}
    </ol>
  );
}
