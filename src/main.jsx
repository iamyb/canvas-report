import React from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import "./index.css";
import { Badge } from "./components/ui/badge.jsx";
import { setExportMode } from "./lib/export-mode.js";

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

function ExportButton({ title }) {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  async function doExport(format) {
    setOpen(false);
    if (busy) return;
    setBusy(true);
    const root = document.getElementById("root");
    // Capture only the content container (max-w-6xl), not the full viewport,
    // so the image has no empty side margins
    const target = document.querySelector("[data-report-content]") || root;
    // Switch to the flat export layout (all tabs expanded) and a light theme so
    // dark reports export legibly; wait for React to flush the DOM changes.
    document.documentElement.setAttribute("data-exporting", "");
    root.classList.add("force-light");
    setExportMode(true);
    await new Promise((r) => setTimeout(r, 120));
    try {
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const stamp = new Date().toISOString().slice(0, 10);
      const base = (title || "report").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "report";
      if (format === "png") {
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `${base}-${stamp}.png`;
        a.click();
      } else {
        // Multi-page A4 PDF: slice the full-height canvas into A4 pages
        const pdfWidthMm = 210;
        const pdfHeightMm = 297;
        const pxPerMm = canvas.width / pdfWidthMm;
        const pagePx = Math.floor(pdfHeightMm * pxPerMm);
        const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
        for (let y = 0, page = 0; y < canvas.height; y += pagePx, page++) {
          const sliceH = Math.min(pagePx, canvas.height - y);
          const slice = document.createElement("canvas");
          slice.width = canvas.width;
          slice.height = sliceH;
          slice.getContext("2d").drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
          if (page > 0) pdf.addPage("a4", "p");
          pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, pdfWidthMm, sliceH / pxPerMm);
        }
        pdf.save(`${base}-${stamp}.pdf`);
      }
    } catch (err) {
      console.error("[canvas-report] export failed", err);
      alert(`Export failed: ${err?.message || err}`);
    } finally {
      setExportMode(false);
      root.classList.remove("force-light");
      document.documentElement.removeAttribute("data-exporting");
      setBusy(false);
    }
  }

  return (
    <div className="relative ml-auto" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        title="Export as PNG / PDF"
        aria-label="Export as PNG or PDF"
        className="export-btn flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {busy ? "Exporting…" : "Export"}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-32 overflow-hidden rounded-md border border-border bg-card shadow-lg">
          {["png", "pdf"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => doExport(f)}
              className="block w-full px-3 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-muted"
            >
              {f === "png" ? "Image (PNG)" : "Document (PDF)"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Layout({ meta, children }) {
  const theme = meta?.theme === "dark" ? " theme-dark" : "";
  const palette = meta?.palette ? ` palette-${meta.palette}` : "";
  return (
    <div className={`min-h-screen${theme}${palette}`}>
      <div className="mx-auto max-w-6xl px-6 py-8" data-report-content>
        {meta && (
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
      <Layout meta={mod.meta}>
        <mod.default />
      </Layout>
    </ErrorBoundary>
  );
}

main();
