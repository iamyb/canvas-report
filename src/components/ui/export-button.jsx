import React from "react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { setExportMode } from "../../lib/export-mode.js";

// Shared PNG/PDF export control. Captures the [data-report-content] container
// (the Layout's max-w-6xl wrapper) so the image has no empty side margins.
// Used by the default Layout header and by the showcase (which renders its own
// header so the title/export target can switch to the open sub-report).
export function ExportButton({ title }) {
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
          slice.getContext("2d").drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH / pxPerMm);
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
          strokeWidth={2}
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
