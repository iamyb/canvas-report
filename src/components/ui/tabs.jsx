import React from "react";
import { cn } from "../../lib/utils.js";
import { onExportModeChange } from "../../lib/export-mode.js";

const TabsCtx = React.createContext(null);

// While a PNG/PDF export is in progress, render every tab panel (stacked) so
// the capture contains all content, not just the active tab.
function useExportMode() {
  const [exporting, setExporting] = React.useState(false);
  React.useEffect(() => onExportModeChange(setExporting), []);
  return exporting;
}

// Collect { value: label } from TabsTrigger elements nested anywhere in children
function collectLabels(children, out) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === TabsTrigger) {
      out[child.props.value] = child.props.children;
    }
    if (child.props?.children) collectLabels(child.props.children, out);
  });
  return out;
}

export function Tabs({ defaultValue, className, children, ...props }) {
  const [value, setValue] = React.useState(defaultValue);
  const labels = React.useMemo(() => collectLabels(children, {}), [children]);
  return (
    <TabsCtx.Provider value={{ value, setValue, labels }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ className, ...props }) {
  const exporting = useExportMode();
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-muted p-1",
        exporting && "hidden",
        className
      )}
      {...props}
    />
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
  const { value: active, labels } = React.useContext(TabsCtx);
  const exporting = useExportMode();
  if (!exporting && active !== value) return null;
  return (
    <div
      className={cn(
        "mt-3",
        exporting && "border-t border-border pt-3 first:border-t-0 first:pt-0",
        className
      )}
      {...props}
    >
      {exporting && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {labels?.[value] || value}
        </p>
      )}
      {children}
    </div>
  );
}
