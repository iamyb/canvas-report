# canvas-report

An agent skill that lets coding agents render analysis results as interactive HTML report dashboards (Canvas).
React + shadcn/ui-style components + Recharts + Tailwind — runs locally, works offline, live reload via Vite HMR.

## Live demo

[▶ Try the interactive showcase](https://iamyb.github.io/canvas-report/) — all 10 sample reports rendered live in a single self-contained HTML file (no server required).

## Installation

```bash
# Via the skills CLI (recommended; supports 80+ agents including Claude Code / Cursor / GitHub Copilot)
npx skills add iamyb/canvas-report

# Or manually clone into any agent's skills directory
git clone https://github.com/iamyb/canvas-report ~/.agents/skills/canvas-report
```

Once installed, the skill activates automatically whenever the agent needs to produce a report / dashboard / visualization.

## How it works

```
skill directory (read-only template) global runtime (user home)
┌─────────────────────────────────┐     ┌───────────────────────────────┐
│ SKILL.md                        │     │ ~/.canvas-report/             │
│ scripts/                        │     │   src/components/ui/...       │
│   setup.sh / setup.ps1          │ ──► │   src/reports/<your-report>   │
│   start.sh / start.ps1          │     │   node_modules/               │
│   canvas-report-assets.tar.gz   │     │   vite.config.js ...          │
└─────────────────────────────────┘     └───────────────────────────────┘
```

- On first use, the `setup` script extracts the source tarball into `~/.canvas-report` and runs `npm ci`
- **Never pollutes the user's workspace**; installed once per machine
- **URL as data source**: include a URL in your request (e.g. `/canvas-report https://example.com/pricing`) and the agent fetches the page and builds the report from its data — data charts are transcribed and redrawn natively, asset images are inlined, and the source is cited
- **The final deliverable is a self-contained single-file HTML** (produced by `export`; double-click to view, shareable, no Node required):
  ```bash
  node scripts/export.mjs <report-id> [output-dir]
  # → ./<report-id>.html (current working directory by default)
  ```
- For iterative development, the `start` script idempotently launches the dev server (default port 5199):
  `http://localhost:5199/?report=<report-id>`

## Manual use (without an agent)

```bash
# macOS / Linux / WSL
sh scripts/setup.sh
sh scripts/start.sh

# Windows PowerShell
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
powershell -ExecutionPolicy Bypass -File scripts\start.ps1
```

Then create a new jsx file under `~/.canvas-report/src/reports/` (see `src/reports/example-report.jsx` for reference)
and open `http://localhost:5199/?report=<filename>`.

## Uninstall

```bash
# Via the skills CLI
npx skills remove iamyb/canvas-report

# Or manually: delete the skill directory
rm -rf ~/.agents/skills/canvas-report    # or wherever you cloned it

# Optional: remove the global runtime (deletes all generated reports + node_modules)
rm -rf ~/.canvas-report
```

Windows PowerShell:

```powershell
Remove-Item -Recurse -Force ~/.agents/skills/canvas-report
Remove-Item -Recurse -Force ~/.canvas-report
```

Exported report HTML files live in your own projects (or wherever you exported them) and are not affected.

## Development

```bash
npm install
npm run dev             # local development (this repo directory)
npm run package         # regenerate scripts/canvas-report-assets.tar.gz (must run and commit after changing src/ or vite.config.js)
npm run export:showcase # rebuild docs/index.html (GitHub Pages demo) from this repo
```

## License

MIT
