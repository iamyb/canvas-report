import { cn } from "../../lib/utils.js";

export function Progress({ value = 0, className, ...props }) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)} {...props}>
      <div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
    </div>
  );
}
