import React from "react";
import { cn } from "../../lib/utils.js";

const TabsCtx = React.createContext(null);

export function Tabs({ defaultValue, className, children, ...props }) {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <TabsCtx.Provider value={{ value, setValue }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ className, ...props }) {
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-lg bg-muted p-1", className)} {...props} />
  );
}

export function TabsTrigger({ value, className, children, ...props }) {
  const { value: active, setValue } = React.useContext(TabsCtx);
  return (
    <button
      type="button"
      onClick={() => setValue(value)}
      className={cn(
        "rounded-md px-3 py-1 text-xs font-medium transition-colors",
        active === value ? "bg-background shadow" : "text-muted-foreground hover:text-foreground"
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children, ...props }) {
  const { value: active } = React.useContext(TabsCtx);
  if (active !== value) return null;
  return (
    <div className={cn("mt-3", className)} {...props}>
      {children}
    </div>
  );
}
