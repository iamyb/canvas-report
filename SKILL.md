---
name: canvas-report
description: Generates self-contained interactive HTML report dashboards using a local React + shadcn/ui-style component library + Recharts project. Use when the agent produces a standalone analytical artifact (data analysis, audits, billing/cost investigations, architecture reviews, dependency comparisons, data-dense content, timelines, charts & tables), or when the user asks for a "report / dashboard / canvas / visualization".
---

# canvas-report

Renders agent-authored reports as interactive web pages. The runtime project is installed in a global directory `~/.canvas-report` (Windows: `%USERPROFILE%\.canvas-report`), **never polluting the user's workspace**.

**The final deliverable is a self-contained single-file HTML** (double-click to view, shareable, no Node required); use the dev server + HMR for iterative development.

## When to use

- The task is a "standalone analytical artifact": quantitative analysis, audits, cost investigations, architecture reviews, dependency/version comparisons, data-dense content, timelines, charts & tables
- The user explicitly asks for a report / dashboard / visualization
- You are about to write a markdown table with more than 10 rows → stop and use a report instead

## Workflow

1. **Collect data**: use existing tool results / file reads. **Never fabricate numbers**; if data is illustrative, label it "Demo data" in `meta.badges`.
   If the user's message contains a URL, treat it as the data source — see **URL as data source** below
2. **Ensure installed** (first time only): check if `~/.canvas-report/node_modules` exists; if not, run the install script in this skill's directory:
   - macOS / Linux / WSL: `sh <skill-dir>/scripts/setup.sh`
   - Windows PowerShell: `powershell -ExecutionPolicy Bypass -File <skill-dir>\scripts\setup.ps1`
3. **Ensure dev server is running** (first time only):
   - macOS / Linux / WSL: `sh <skill-dir>/scripts/start.sh`
   - Windows PowerShell: `powershell -ExecutionPolicy Bypass -File <skill-dir>\scripts\start.ps1`
   The script probes the port (default 5199) and returns the URL if already running
4. **Create a new report** at `~/.canvas-report/src/reports/<report-id>.jsx` (kebab-case, unique filename):
   ```jsx
   export const meta = {
     title: "Report Title",
     description: "One-line summary",
     badges: [{ label: "Demo data", variant: "warning" }], // optional
     theme: "dark", // optional: "dark"; omit = default light
     palette: "warm", // optional: "warm" | "mono", changes chart data colors; omit = default
     updatedAt: "2026-10-14 10:30", // optional
   };
   export default function Report() {
     return <div className="space-y-5">...</div>;
   }
   ```
5. **Dev verification** (optional but recommended): with the dev server running, open `http://localhost:5199/?report=<report-id>`,
   confirm it renders correctly and the dev log has no `[canvas-report]` errors; edit the JSX directly, HMR auto-refreshes
6. **Export the deliverable (required)**:
   - macOS / Linux / WSL: `node <skill-dir>/scripts/export.mjs <report-id> [output-dir]`
   - Windows PowerShell: `node <skill-dir>\scripts\export.mjs <report-id> [output-dir]`
   Produces a **self-contained single-file HTML** (all JS/CSS inlined, chart sorting and other interactions preserved).
   Default output is the **current working directory** (the user's project) as `<report-id>.html` — do not ask the user where to put it;
   pass a second argument (output dir) only if the user explicitly wants a different location
7. **Deliver**: tell the user the HTML file path (double-click to view, shareable)

## URL as data source

When the user invokes the skill with a URL (e.g. `/canvas-report https://example.com/pricing`), fetch that page and build the report from its data. No special syntax is needed — a URL in the request means "use this page as the data source".

1. **Fetch**: prefer a lightweight fetch (web-fetch tool / curl). If the page is JS-rendered (SPA, lazy-loaded tables) and the fetch returns an empty shell, open it with the browser tools and read the rendered DOM instead
2. **Extract data, not prose**: pull tables, metrics, timelines, and lists; reorganize them into the report structure below. Do not copy long passages of the page's text verbatim
3. **Images** — classify each `<img>` and handle by type:
   - **Data charts** (screenshots of charts/graphs): do NOT embed the image. Read the chart visually and transcribe the values into structured data, then redraw with native Recharts (interactive, theme-consistent). Values read off an image are approximate — add a note like "data transcribed from source image, approximate". Do not add a "Demo data" badge (the data has a real source; only the precision is limited)
   - **Asset images** (logos, architecture diagrams, screenshot evidence): download and inline as a base64 data URI (`<img src="data:image/png;base64,..." />`) — the deliverable must stay offline-capable, so never hotlink the original URL. Budget: skip images > ~200 KB or keep at most 3–4 per report; add a caption with the source
   - Download fails (anti-bot, too large): skip the image and note "original at <url>" in the report
4. **Cite the source**: put the source URL + fetch date in `meta.description` or a footer line (e.g. "Source: <url>, fetched 2026-10-14"). Real fetched data → no "Demo data" badge; if parts are inferred or incomplete, say so explicitly
5. **On failure** (timeout, paywall, login required, anti-bot): tell the user what failed and ask whether to use an alternative source or have them provide the data. **Never fabricate** the page's contents

## Report structure (conclusion first)

1. KPI row: `<div className="grid grid-cols-2 gap-3 md:grid-cols-4">` + `<Stat>` (3–6 core metrics)
2. Key findings: 2–4 conclusions in a `<Card>` (list-disc); write conclusions, not raw data listings
3. Charts: trend → LineChart, comparison → BarChart, share → PieChart, distribution → AreaChart
4. Detail table: `<Table>` + `useSort` (click header to sort)
5. Timeline: `<Timeline>` (event-based reports)
6. Appendix: data sources, time range, known limitations

## Layout: when to use Tabs vs. flat grid

**Default to flat layout. Tabs are a legitimate option, not a last resort. Hard constraint: max 3 tabs.**

Three valid reasons to use Tabs:
1. **Page too long**: flat layout exceeds 3 screens of scrolling (~2000px)
2. **Strong data correlation**: several sections are different facets of the same dataset (e.g. effect size / significance / business impact of the same experiment portfolio); switching tabs = switching perspective, which is more focused than a flat layout
3. **UI alignment**: sections have very different heights; flat layout leaves large gaps, tabs keep each screen aligned

Otherwise, use flat layout. How to decide: estimate total height with all sections laid out flat —
- **≤ 3 screens**: lay everything out flat, user scrolls
- **> 3 screens**: put the 2–3 longest sections in Tabs, keep the rest flat

| Scenario | Layout |
|----------|--------|
| 4–6 single charts + 1 small table | All flat (2-col grid + full-width table) |
| 2–3 facets of the same dataset (strong correlation) | Tabs (≤3) or flat |
| 1 large table (≥15 rows) + 2 charts | Charts flat, table full-width (or in a Tab) |
| 5+ sections each with chart + table + text | Use Tabs (pick the 3 longest, rest flat) |

Flat grid (no new components — just `Card` + `grid` classes):

```jsx
<div className="grid gap-4 md:grid-cols-2">
  <Card>…Chart A…</Card>
  <Card>…Chart B…</Card>
  <Card>…Chart C…</Card>
  <Card>…Chart D…</Card>
</div>
```

- Side-by-side charts enable direct comparison, better UX than clicking through tabs
- A single wide chart (e.g. horizontal BarChart, scatter plot) takes the full row: `md:col-span-2`
- Rule of thumb: **most reports (≤6 sections) work fine with a flat layout**; when you do use Tabs, **use at most 3**, and prefer sections with strong correlation or large height differences

## Component library (src/components/ui/)

- Layout: `Card CardHeader CardTitle CardDescription CardContent CardFooter`
- Metric: `Stat { label, value, delta?(±%), deltaLabel?, hint?, tone?(default|success|warning|destructive), sparkline?(number[]), sparklineColor? }`
  — `sparkline` renders a mini trend line to the right of the label (pure SVG, no Recharts dependency)
- Callout: `Callout { tone?(info|success|warning|danger), title?, children }` — key conclusions / risks / recommendations, more prominent than a bare Card
- Score bar: `ScoreBar { label?, value(0–100+), good?(default 80), warn?(default 60), suffix?(default "%") }` — auto-colored by threshold (green/yellow/red)
- Mini trend: `Sparkline { data(number[]), width?, height?, color? }` — can be used standalone in table cells, etc.
- Badge: `Badge variant="default|secondary|success|warning|destructive|outline"`
- Table: `Table TableHeader TableBody TableRow TableHead TableCell`
- Sort hook: `useSort(rows, {key,dir})` → `{ sorted, sort, toggle }`;
  header: `<TableHead onClick={() => toggle("p99")}>P99{sortIcon}</TableHead>`
- Tabs: `Tabs defaultValue` → `TabsList` → `TabsTrigger value` / `TabsContent value`
- Other: `Progress { value }`, `Separator`, `Timeline { items: [{date, title, description}] }`

## Consistent chart style (Recharts)

```jsx
<ResponsiveContainer width="100%" height={260}>
  <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
    <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" vertical={false} />
    <XAxis dataKey="name" tick={{ fill: "var(--color-chart-tick)", fontSize: 12 }} axisLine={false} tickLine={false} />
    <YAxis tick={{ fill: "var(--color-chart-tick)", fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
    <Tooltip contentStyle={{ backgroundColor: "var(--color-chart-tooltip-bg)", border: "1px solid var(--color-chart-tooltip-border)", borderRadius: 8, color: "var(--color-chart-tooltip-fg)" }} labelStyle={{ color: "var(--color-chart-tick)" }} />
    <Legend wrapperStyle={{ fontSize: 12 }} />
    <Bar dataKey="value" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

### Four color categories

| Category | Variables | Rule |
|----------|-----------|------|
| **Surface** | `--color-background` / `--color-card` / `--color-foreground` / `--color-muted-foreground` / `--color-border` | Switch with theme; use Tailwind semantic classes in reports (`bg-card`, `text-muted-foreground`, etc.), **never hardcode hex** |
| **Structural** | `--color-chart-grid` / `--color-chart-tick` / `--color-chart-tooltip-bg` / `--color-chart-tooltip-border` / `--color-chart-tooltip-fg` | Chart skeleton; switch with theme; **must use `var()`** in reports, never hex |
| **Data** | `--color-chart-1` ~ `--color-chart-6` | Chart series colors; **must use `var()`** in reports; overridable via `palette` |
| **Semantic** | `--color-success` / `--color-warning` / `--color-destructive` | Status/alert; fixed, does not change with theme; use Tailwind classes (`text-destructive`) or hex (`#ef4444`) in reports |

### Theme (optional)

Default is **light**. Add `theme: "dark"` to `meta` when the user requests dark mode:

```jsx
export const meta = {
  title: "...",
  theme: "dark", // optional: "dark"; omit = default light
  palette: "warm", // optional: "warm" | "mono", changes chart data colors
};
```

- `theme` switches surface + structural colors; data and semantic colors stay the same
- `palette` only overrides data colors; they can be combined (e.g. `theme: "dark"` + `palette: "warm"`)

### Palette presets (optional)

The default palette is fine. When the user requests a different color scheme, add `palette` to `meta`:

- `"warm"`: warm tones (orange/gold/red/pink), suited for cost/finance reports
- `"mono"`: monochrome (grayscale + blue), suited for technical/architecture reports
- For non-preset colors, override at the top of the report JSX with `<style>{`.my-report { --color-chart-1: #xxx; ... }`}</style>` (data colors only)

- Line: `type="monotone" strokeWidth={2} dot={{ r: 2 }}`
- Donut: `innerRadius={50} outerRadius={80} paddingAngle={2}` + `Cell` for per-slice colors

## Numbers & styling

- Thousands separators; percentages to 1 decimal place; always include units
- Missing data: write "—"; improving = `text-success`, worsening = `text-destructive`
- Page width is controlled by the Layout; do not add max-width inside the report
- Do not introduce any new external dependencies (webfonts, icon libraries, etc.)

## Error handling (required)

Two sources of errors:

1. **Dev mode**: the page shows "Report failed to render" or the dev log contains `[canvas-report] error in report "x"`
   (log location: `/tmp/canvas-report-dev.log` on macOS/Linux/WSL, `%TEMP%\canvas-report-dev.log` on Windows)
2. **Export build failure**: `export.mjs` prints a vite error (syntax error, missing import, etc.)

Handling: read the error message + stack, locate the JSX line → fix → re-verify (dev auto-refreshes on save; for export, re-run the command) → repeat until no errors

Common errors: data field names not matching chart dataKey, destructuring an undefined value, filename colliding with an existing report,
Recharts component missing the data prop.

## Hard rules

- Never fabricate data; illustrative data must be explicitly labeled with a badge
- No CDN / external resources (keep the output offline-capable)
- One report per file; if it exceeds ~400 lines, split sections with Tabs or trim table rows
- Do not change the public API of existing `components/ui/` components; if a new component is truly needed, add a new file in `components/ui/` and update this document
- Do not create a canvas-report project inside the user's workspace; all runtime files live in `~/.canvas-report`

## Reference examples (src/reports/)

Consult these examples before writing a report; each deliberately covers a different component combination:

- `cloud-cost-audit.jsx` — **Tabs sections + multiple charts + sortable large table**: KPI row, LineChart (trend), PieChart (share), horizontal BarChart (Top N), 20-row sortable detail table + status Badge, optimization recommendations table
- `api-perf-review.jsx` — **Threshold coloring + before/after comparison**: Bars exceeding the P99 SLO conditionally colored via `Cell`, AreaChart (error trend), before/after grouped BarChart, conditionally colored endpoint matrix table
- `incident-postmortem.jsx` — **Timeline-driven + dual-axis chart**: Timeline (event flow), dual Y-axis LineChart (QPS + error rate), PieChart (blast radius), root-cause Card, action items table + Progress
- `dependency-audit.jsx` — **Multiple Tabs + severity tiers**: KPI, PieChart (severity), BarChart (package age distribution), CVE detail table (severity Badge + fix recommendations), license distribution, Progress (fix progress)
- `devops-maturity.jsx` — **DORA four metrics + team comparison + AI impact**: KPI row, team DORA table (sortable + tiered Badge), dual Y-axis trend LineChart, AI before/after horizontal BarChart (conditional coloring + `Callout` risk note), improvement roadmap table
- `saas-growth.jsx` — **SaaS growth + cohort analysis**: KPI row with `sparkline` mini trends, MRR AreaChart (waterfall), churn BarChart (segmented coloring), NRR cohort BarChart (conditional coloring), unit economics table + `ScoreBar` threshold coloring, sortable Top customers table
- `ab-test-results.jsx` — **A/B experiment portfolio + statistical significance (flat layout)**: sortable portfolio table (full width), ScatterChart (effect size vs −log₁₀p, with p=0.05 reference line, full width), control/variant grouped BarChart + business impact BarChart (side by side in a 2-col grid) (real case: Dutch Railways NS)
- `ml-model-evaluation.jsx` — **Multi-benchmark model comparison + cost analysis (flat layout)**: three horizontal BarCharts for MMLU/GPQA/HumanEval (open/closed-source coloring) + ScatterChart (cost vs capability, log axis) in a 2×2 grid, MMLU vs HumanEval grouped BarChart + sortable table (full width) (real data: llm-stats.com)
- `showcase.jsx` — **Gallery of all sample reports**: grid of cards, each with a live scaled-down preview (CSS `transform: scale`) of the full report; click a card to open the full interactive report inline (no navigation, so it works in the exported single-file HTML). Useful as a self-contained demo page.

## Quick reference

```bash
# Install (first time only; target: ~/.canvas-report)
sh scripts/setup.sh            # macOS / Linux / WSL
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1   # Windows

# Start dev server (idempotent, returns immediately if already running; only needed for dev verification)
sh scripts/start.sh
powershell -ExecutionPolicy Bypass -File scripts\start.ps1

# Export single-file HTML (final deliverable, same command on all platforms)
node scripts/export.mjs <report-id> [output-dir]
# → ~/.canvas-report/dist/<report-id>.html  double-click to view

# Dev verification URL
http://localhost:5199/?report=<report-id>
```
