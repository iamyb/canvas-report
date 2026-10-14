// Rebuild the GitHub Pages showcase (docs/index.html) from THIS repository,
// independent of the global ~/.canvas-report install (which may be stale).
// Usage: npm run export:showcase
import { renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
process.env.CANVAS_REPORT_HOME = process.env.CANVAS_REPORT_HOME || repoRoot;
process.argv = [process.argv[0], "export.mjs", "showcase", "docs"];

await import("./export.mjs");

renameSync(join(repoRoot, "docs", "showcase.html"), join(repoRoot, "docs", "index.html"));
console.log("[canvas-report] docs/index.html updated for GitHub Pages");
