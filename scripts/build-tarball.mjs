// Package the runtime project assets (pure source, no node_modules) into scripts/canvas-report-assets.tar.gz
// Usage: node scripts/build-tarball.mjs   (or npm run package)
// Must be run before publishing, and the generated tarball must be committed together.
// Relies on the system tar command (bundled with Windows 10+ / macOS / Linux), no extra npm dependencies.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "scripts", "canvas-report-assets.tar.gz");

// Version marker: writes the current timestamp on every build; the setup script uses it to detect dependency/source changes
writeFileSync(join(root, ".canvas-version"), new Date().toISOString() + "\n");

const FILES = [".canvas-version", "package.json", "package-lock.json", "vite.config.js", "index.html"];
const DIRS = ["src"];

function walk(dir, base, outList) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === ".git") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (dir === join(root, "src") && name === "reports") continue; // reports are not included in the tarball
      walk(p, base, outList);
    } else {
      outList.push(relative(base, p).split(sep).join("/")); // normalize to POSIX paths
    }
  }
}

const entries = [];
for (const f of FILES) {
  if (!existsSync(join(root, f))) throw new Error(`missing file: ${f}`);
  entries.push(f);
}
for (const d of DIRS) walk(join(root, d), root, entries);

rmSync(out, { force: true });
execFileSync("tar", ["-czf", out, ...entries], { cwd: root, stdio: "inherit" });

const kb = (statSync(out).size / 1024).toFixed(1);
console.log(`[canvas-report] packaged ${entries.length} files -> scripts/canvas-report-assets.tar.gz (${kb} KB)`);
