// Build a report into a self-contained single-file HTML (double-click to view, shareable)
// Usage: node scripts/export.mjs <report-id> [output-dir]
//   report-id: filename of src/reports/<report-id>.jsx (without .jsx)
//   output-dir: defaults to <global project>/dist
// Examples: node scripts/export.mjs cost-audit
//           node scripts/export.mjs cost-audit D:\some\project\reports
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = process.env.CANVAS_REPORT_HOME || join(process.env.USERPROFILE || process.env.HOME, ".canvas-report");

const reportId = process.argv[2];
if (!reportId || !/^[a-z0-9-]+$/.test(reportId)) {
  console.error("Usage: node scripts/export.mjs <report-id> [output-dir]");
  console.error("  report-id is the filename of src/reports/<report-id>.jsx (kebab-case)");
  process.exit(1);
}

const outDir = resolve(process.argv[3] || join(target, "dist"));

if (!existsSync(join(target, "node_modules"))) {
  console.error("Error: not installed yet, run the setup script first");
  process.exit(1);
}
if (!existsSync(join(target, "src", "reports", `${reportId}.jsx`))) {
  console.error(`Error: report ${reportId} not found (~/.canvas-report/src/reports/${reportId}.jsx)`);
  process.exit(1);
}

console.log(`[canvas-report] building ${reportId} ...`);
execFileSync(
  process.execPath,
  [join(target, "node_modules", "vite", "bin", "vite.js"), "build"],
  {
    cwd: target,
    stdio: "inherit",
    env: { ...process.env, VITE_REPORT_ID: reportId },
  }
);

const built = join(target, "dist", "index.html");
if (!existsSync(built)) {
  console.error("Error: build did not produce dist/index.html");
  process.exit(1);
}

// Clean up vite build artifacts (assets, etc.), keeping index.html and exported <report-id>.html files;
// must happen before copying to outDir, otherwise when outDir is target/dist the just-copied file would be deleted
for (const name of readdirSync(join(target, "dist"))) {
  if (name === "index.html" || name.endsWith(".html")) continue;
  rmSync(join(target, "dist", name), { recursive: true, force: true });
}

mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, `${reportId}.html`);
copyFileSync(built, outFile);

const kb = (statSync(outFile).size / 1024).toFixed(0);
console.log(`[canvas-report] exported: ${outFile} (${kb} KB)`);
console.log("[canvas-report] double-click the file to view it in a browser, no server required.");
