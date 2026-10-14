import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Badge } from "./components/ui/badge.jsx";
import { ExportButton } from "./components/ui/export-button.jsx";

const modules = import.meta.glob("./reports/*.jsx", { eager: true });
const registry = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => [path.replace(/^\.\/reports\/(.+)\.jsx$/, "$1"), mod])
);

function sendError(reportId, payload) {
  console.error("[canvas-report]", payload);
  fetch("/__canvas/report-error", {
    method: "POST",
    body: JSON.stringify({ reportId, at: new Date().toISOString(), ...payload }),
  }).catch(() => {});
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    sendError(this.props.reportId, {
      message: String(error?.message || error),
      stack: info?.componentStack || "",
    });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-3xl p-8">
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6">
            <h2 className="text-sm font-semibold text-destructive">Report failed to render</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              The error has been sent to the dev server terminal; the page will auto-refresh once the report code is fixed and saved.
            </p>
            <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-background p-3 text-xs leading-relaxed text-destructive">
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Layout({ meta, children, hideHeader }) {
  const theme = meta?.theme === "dark" ? " theme-dark" : "";
  const palette = meta?.palette ? ` palette-${meta.palette}` : "";
  return (
    <div className={`min-h-screen${theme}${palette}`}>
      <div className="mx-auto max-w-6xl px-6 py-8" data-report-content>
        {meta && !hideHeader && (
          <header className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold">{meta.title}</h1>
              {(meta.badges || []).map((b, i) => (
                <Badge key={i} variant={b.variant}>
                  {b.label}
                </Badge>
              ))}
              <ExportButton title={meta?.title} />
            </div>
            {meta.description && (
              <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
            )}
          </header>
        )}
        {children}
        <footer className="mt-8 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <span>canvas-report</span>
          <span>{meta?.updatedAt || new Date().toLocaleString("en-US")}</span>
        </footer>
      </div>
    </div>
  );
}

function main() {
  // at build time, VITE_REPORT_ID pins a single report (used by export.mjs); in dev mode the URL param is used
  const pinned = import.meta.env.VITE_REPORT_ID;
  const id = pinned || new URLSearchParams(location.search).get("report");
  const wanted = id || Object.keys(registry)[0];
  const mod = registry[wanted];

  window.addEventListener("error", (e) =>
    sendError(wanted, { message: e.message, file: e.filename, line: e.lineno })
  );
  window.addEventListener("unhandledrejection", (e) =>
    sendError(wanted, { message: String(e.reason?.message || e.reason) })
  );

  if (!mod) {
    createRoot(document.getElementById("root")).render(
      <ErrorBoundary reportId={wanted}>
        <div className="p-8 text-sm text-destructive">
          Report <b>{wanted}</b> not found. Available: {Object.keys(registry).join(", ") || "(none)"}
        </div>
      </ErrorBoundary>
    );
    return;
  }

  createRoot(document.getElementById("root")).render(
    <ErrorBoundary reportId={wanted}>
      <Layout meta={mod.meta} hideHeader={mod.meta?.hideHeader}>
        <mod.default />
      </Layout>
    </ErrorBoundary>
  );
}

main();
