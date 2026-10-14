import { cn } from "../../lib/utils.js";

export function Separator({ className, ...props }) {
  return <hr className={cn("my-4 border-border", className)} {...props} />;
}
