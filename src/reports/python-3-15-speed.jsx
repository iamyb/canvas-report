import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Stat } from "../components/ui/stat.jsx";
import { Callout } from "../components/ui/callout.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table.jsx";
import { useSort } from "../components/ui/use-sort.js";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Cell,
} from "recharts";

export const meta = {
  title: "How Fast Is Python 3.15?",
  description:
    "Informal CPython 3.15 benchmark vs. 3.10–3.14, PyPy, Node.js and Rust — fibo & bubble, single- and multi-threaded, incl. JIT & free-threading builds. Source: blog.miguelgrinberg.com, fetched 2026-10-14",
  palette: "observable",
  updatedAt: "2026-10-14 16:22",
};

const tooltipStyle = {
  backgroundColor: "var(--color-chart-tooltip-bg)",
  border: "1px solid var(--color-chart-tooltip-border)",
  borderRadius: 8,
  color: "var(--color-chart-tooltip-fg)",
};
const tickStyle = { fill: "var(--color-chart-tick)", fontSize: 12 };
const axisProps = { tick: tickStyle, axisLine: false, tickLine: false };

// ---- Single-threaded, standard interpreter (seconds) ----
const fiboStd = [
  { name: "3.10", time: 15.944, vs315: 0.44, vsPrev: null },
  { name: "3.11", time: 9.406, vs315: 0.74, vsPrev: 1.7 },
  { name: "3.12", time: 8.855, vs315: 0.78, vsPrev: 1.06 },
  { name: "3.13", time: 8.817, vs315: 0.79, vsPrev: 1.0 },
  { name: "3.14", time: 7.166, vs315: 0.97, vsPrev: 1.23 },
  { name: "3.15", time: 6.936, vs315: 1.0, vsPrev: 1.03 },
];
const bubbleStd = [
  { name: "3.10", time: 3.992, vs315: 0.49, vsPrev: null },
  { name: "3.11", time: 2.624, vs315: 0.75, vsPrev: 1.52 },
  { name: "3.12", time: 2.734, vs315: 0.72, vsPrev: 0.96 },
  { name: "3.13", time: 2.833, vs315: 0.7, vsPrev: 0.97 },
  { name: "3.14", time: 2.058, vs315: 0.96, vsPrev: 1.38 },
  { name: "3.15", time: 1.972, vs315: 1.0, vsPrev: 1.04 },
];

// ---- Single-threaded, all interpreters (speed vs CPython 3.15) ----
const fiboInterop = [
  { name: "3.15", speed: 1.0, kind: "cpython" },
  { name: "3.14", speed: 0.97, kind: "cpython" },
  { name: "3.13", speed: 0.79, kind: "cpython" },
  { name: "3.12", speed: 0.78, kind: "cpython" },
  { name: "3.11", speed: 0.74, kind: "cpython" },
  { name: "3.10", speed: 0.44, kind: "cpython" },
  { name: "Node 26.3", speed: 4.99, kind: "other" },
  { name: "PyPy 3.12", speed: 5.54, kind: "other" },
  { name: "Rust 1.97", speed: 77.24, kind: "rust" },
];
const bubbleInterop = [
  { name: "3.15", speed: 1.0, kind: "cpython" },
  { name: "3.14", speed: 0.96, kind: "cpython" },
  { name: "3.13", speed: 0.7, kind: "cpython" },
  { name: "3.12", speed: 0.72, kind: "cpython" },
  { name: "3.11", speed: 0.75, kind: "cpython" },
  { name: "3.10", speed: 0.49, kind: "cpython" },
  { name: "PyPy 3.12", speed: 18.37, kind: "other" },
  { name: "Node 26.3", speed: 30.66, kind: "other" },
  { name: "Rust 1.97", speed: 50.42, kind: "rust" },
];
const kindColor = {
  cpython: "var(--color-chart-1)",
  other: "var(--color-chart-2)",
  rust: "var(--color-chart-3)",
};

// ---- Multi-threaded (4 threads), 3.15 builds (seconds) ----
const mt315 = [
  { test: "fibo(40)", standard: 32.542, JIT: 27.164, "Free-threading": 7.235 },
  { test: "bubble(10k)", standard: 8.451, JIT: 6.642, "Free-threading": 4.855 },
];

// ---- Full detail: single-threaded (sortable) ----
const stRows = [
  { test: "fibo", interp: "CPython 3.10", time: 15.944, vs315: 0.44, vsPrev: null },
  { test: "fibo", interp: "CPython 3.11", time: 9.406, vs315: 0.74, vsPrev: 1.7 },
  { test: "fibo", interp: "CPython 3.12", time: 8.855, vs315: 0.78, vsPrev: 1.06 },
  { test: "fibo", interp: "CPython 3.13", time: 8.817, vs315: 0.79, vsPrev: 1.0 },
  { test: "fibo", interp: "CPython 3.14", time: 7.166, vs315: 0.97, vsPrev: 1.23 },
  { test: "fibo", interp: "CPython 3.15", time: 6.936, vs315: 1.0, vsPrev: 1.03 },
  { test: "fibo", interp: "PyPy 3.12", time: 1.252, vs315: 5.54, vsPrev: null },
  { test: "fibo", interp: "Node 26.3", time: 1.39, vs315: 4.99, vsPrev: null },
  { test: "fibo", interp: "Rust 1.97", time: 0.0898, vs315: 77.24, vsPrev: null },
  { test: "bubble", interp: "CPython 3.10", time: 3.992, vs315: 0.49, vsPrev: null },
  { test: "bubble", interp: "CPython 3.11", time: 2.624, vs315: 0.75, vsPrev: 1.52 },
  { test: "bubble", interp: "CPython 3.12", time: 2.734, vs315: 0.72, vsPrev: 0.96 },
  { test: "bubble", interp: "CPython 3.13", time: 2.833, vs315: 0.7, vsPrev: 0.97 },
  { test: "bubble", interp: "CPython 3.14", time: 2.058, vs315: 0.96, vsPrev: 1.38 },
  { test: "bubble", interp: "CPython 3.15", time: 1.972, vs315: 1.0, vsPrev: 1.04 },
  { test: "bubble", interp: "PyPy 3.12", time: 0.1073, vs315: 18.37, vsPrev: null },
  { test: "bubble", interp: "Node 26.3", time: 0.0643, vs315: 30.66, vsPrev: null },
  { test: "bubble", interp: "Rust 1.97", time: 0.0391, vs315: 50.42, vsPrev: null },
];

// ---- Full detail: multi-threaded + JIT / free-threading (sortable) ----
const mtRows = [
  { test: "fibo · 4 thr", build: "CPython 3.14 std", time: 31.837, vs315: 1.02, vsPrev: 1.22 },
  { test: "fibo · 4 thr", build: "CPython 3.15 std", time: 32.542, vs315: 0.98, vsPrev: null },
  { test: "fibo · 4 thr", build: "PyPy 3.12", time: 5.639, vs315: 5.77, vsPrev: null },
  { test: "fibo · 4 thr", build: "CPython 3.15 JIT", time: 27.164, vs315: 1.2, vsPrev: 1.14 },
  { test: "fibo · 4 thr", build: "CPython 3.15 FT", time: 7.235, vs315: 4.5, vsPrev: 1.01 },
  { test: "bubble · 4 thr", build: "CPython 3.14 std", time: 8.72, vs315: 0.97, vsPrev: 1.28 },
  { test: "bubble · 4 thr", build: "CPython 3.15 std", time: 8.451, vs315: 1.03, vsPrev: null },
  { test: "bubble · 4 thr", build: "PyPy 3.12", time: 0.517, vs315: 16.36, vsPrev: null },
  { test: "bubble · 4 thr", build: "CPython 3.15 JIT", time: 6.642, vs315: 1.27, vsPrev: 1.5 },
  { test: "bubble · 4 thr", build: "CPython 3.15 FT", time: 4.855, vs315: 1.74, vsPrev: 1.03 },
  { test: "fibo · 1 thr", build: "CPython 3.15 JIT", time: 5.763, vs315: 1.2, vsPrev: 1.24 },
  { test: "fibo · 1 thr", build: "CPython 3.15 FT", time: 7.03, vs315: 0.99, vsPrev: 1.01 },
  { test: "bubble · 1 thr", build: "CPython 3.15 JIT", time: 1.544, vs315: 1.28, vsPrev: 1.53 },
  { test: "bubble · 1 thr", build: "CPython 3.15 FT", time: 2.681, vs315: 0.74, vsPrev: 1.02 },
];

function speedBadge(v) {
  if (v == null) return <span className="text-muted-foreground">—</span>;
  if (v >= 1.2) return <Badge variant="success">{v.toFixed(2)}x</Badge>;
  if (v >= 0.95) return <Badge variant="secondary">{v.toFixed(2)}x</Badge>;
  return <Badge variant="destructive">{v.toFixed(2)}x</Badge>;
}

function DetailTable({ rows, secondKey, secondLabel }) {
  const { sorted, sort, toggle } = useSort(rows, { key: "time", dir: "asc" });
  const icon = (key) => (sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "");
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Test</TableHead>
          <TableHead onClick={() => toggle(secondKey)} className="cursor-pointer">
            {secondLabel}
            {icon(secondKey)}
          </TableHead>
          <TableHead onClick={() => toggle("time")} className="cursor-pointer">
            Time (s){icon("time")}
          </TableHead>
          <TableHead onClick={() => toggle("vs315")} className="cursor-pointer">
            vs 3.15{icon("vs315")}
          </TableHead>
          <TableHead onClick={() => toggle("vsPrev")} className="cursor-pointer">
            vs prev{icon("vsPrev")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((r) => (
          <TableRow key={r[secondKey] + r.test}>
            <TableCell>{r.test}</TableCell>
            <TableCell className="font-medium">{r[secondKey]}</TableCell>
            <TableCell>{r.time.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</TableCell>
            <TableCell>{speedBadge(r.vs315)}</TableCell>
            <TableCell>{speedBadge(r.vsPrev)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function Report() {
  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="3.15 JIT vs standard (fibo, 1 thr)" value="+20%" tone="success" hint="5.76 s vs 6.94 s — first year JIT beats the stock build" />
        <Stat label="3.15 free-threaded vs standard (fibo, 4 thr)" value="4.5x" tone="success" hint="7.24 s vs 32.54 s — GIL removed" />
        <Stat label="3.15 vs 3.14, standard interpreter" value="±3%" tone="default" hint="Small mixed deltas across the 4 tests" />
        <Stat label="Rust vs CPython 3.15 (fibo, 1 thr)" value="77.2x" tone="warning" hint="0.090 s vs 6.936 s — the ceiling" />
      </div>

      {/* Key findings */}
      <Card>
        <CardHeader>
          <CardTitle>Key findings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1.5 pl-5 text-sm">
            <li>
              <strong>3.15 is a minor release performance-wise.</strong> Standard 3.15 lands within ±3% of 3.14 in all four tests — small gains on the single-threaded tests, a small regression in multi-threaded fibo. The real leaps remain 3.11 (+60–70% over 3.10) and 3.14 (+20–38% over 3.13).
            </li>
            <li>
              <strong>The 3.15 JIT is the story of this release.</strong> It is 1.20x–1.28x faster than the standard interpreter in every single-threaded test, and keeps a 1.20x–1.27x edge under 4 threads — faster than any stock CPython build ever was, though it is still experimental.
            </li>
            <li>
              <strong>Free-threading shines exactly where it should.</strong> Single-threaded, it matches the 3.14 build (slightly behind standard in bubble). With 4 threads it runs 4.5x faster than standard on fibo and 1.74x on bubble — real GIL-free concurrency.
            </li>
            <li>
              <strong>PyPy and Rust dominate CPython</strong> as before: PyPy is 5.5x–18.4x faster, Rust 50x–77x. Node.js wins bubble single-threaded (30.7x) but PyPy takes fibo.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Version trend, single-threaded */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">fibo(40) — single-threaded, CPython 3.10 → 3.15</CardTitle>
            <CardDescription>Lower is better. Steps: 3.11 and 3.14.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={fiboStd} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} width={44} unit=" s" />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--color-chart-tick)" }} formatter={(v) => [`${v} s`, "time"]} />
                <Line type="monotone" dataKey="time" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">bubble(10,000) — single-threaded, CPython 3.10 → 3.15</CardTitle>
            <CardDescription>Lower is better. 3.12 and 3.13 were minor regressions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={bubbleStd} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} width={40} unit=" s" />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--color-chart-tick)" }} formatter={(v) => [`${v} s`, "time"]} />
                <Line type="monotone" dataKey="time" stroke="var(--color-chart-2)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">fibo — speed vs CPython 3.15 (single-threaded)</CardTitle>
            <CardDescription>Higher is better. PyPy 5.54x, Node 4.99x, Rust 77.2x.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={fiboInterop} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" {...axisProps} />
                <YAxis type="category" dataKey="name" {...axisProps} width={72} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--color-chart-tick)" }} formatter={(v) => [`${v}x`, "speed"]} />
                <Bar dataKey="speed" radius={[0, 4, 4, 0]}>
                  {fiboInterop.map((d) => (
                    <Cell key={d.name} fill={kindColor[d.kind]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">bubble — speed vs CPython 3.15 (single-threaded)</CardTitle>
            <CardDescription>Higher is better. Node wins here: 30.7x vs PyPy 18.4x.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bubbleInterop} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" {...axisProps} />
                <YAxis type="category" dataKey="name" {...axisProps} width={72} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--color-chart-tick)" }} formatter={(v) => [`${v}x`, "speed"]} />
                <Bar dataKey="speed" radius={[0, 4, 4, 0]}>
                  {bubbleInterop.map((d) => (
                    <Cell key={d.name} fill={kindColor[d.kind]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Multi-threaded 3.15 builds */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">3.15 builds, 4 threads — where free-threading pays off</CardTitle>
          <CardDescription>Seconds; lower is better. Free-threading (GIL removed) runs 4.5x faster than standard on fibo.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mt315} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="test" {...axisProps} />
              <YAxis {...axisProps} width={44} unit=" s" />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--color-chart-tick)" }} formatter={(v) => `${v} s`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="standard" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="JIT" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Free-threading" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detail tables */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Single-threaded — all interpreters</CardTitle>
            <CardDescription>Click headers to sort. Times are averages of 3 runs.</CardDescription>
          </CardHeader>
          <CardContent>
            <DetailTable rows={stRows} secondKey="interp" secondLabel="Interpreter" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Multi-threaded & JIT / free-threading builds</CardTitle>
            <CardDescription>3.15 builds for both thread modes; JIT/FT first shipped in 3.13.</CardDescription>
          </CardHeader>
          <CardContent>
            <DetailTable rows={mtRows} secondKey="build" secondLabel="Build" />
          </CardContent>
        </Card>
      </div>

      {/* Conclusion */}
      <Callout tone="info" title="Should you upgrade to 3.15 for speed? (author's conclusion)">
        <p className="text-sm">
          Not for performance alone — 3.15 is at best a fairly minor improvement over 3.14, with mixed small gains and
          regressions. The one clear win is the experimental <strong>JIT</strong> (+20–28%), which the author would only
          trust in production once it exits its experimental phase. The author will use 3.15 as a day-to-day interpreter and
          keep production on 3.14 for now, upgrading for features (comprehension unpacking, lazy imports) rather than speed.
        </p>
      </Callout>

      {/* Appendix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Methodology & limitations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Source: Miguel Grinberg, "How fast is Python 3.15?", blog.miguelgrinberg.com, fetched 2026-10-14 (tested on CPython 3.15.0rc3).</li>
            <li>Tests: fibo.py (recursive Fibonacci to 40) and bubble.py (bubble-sort 10,000 random numbers), each single-threaded and with 4 threads. No I/O-bound code.</li>
            <li>Participants: CPython 3.10–3.15, PyPy 3.12, Node.js 26.3, Rust 1.97; JIT and free-threading builds for CPython 3.13+.</li>
            <li>Each program run 3 times, average reported. Machine: Linux laptop, Intel Core i5, Gentoo Linux. Speed ratios: 1x = same speed as 3.15; higher = faster.</li>
            <li>Author labels this an "informal" benchmark: two programs are not a comprehensive performance profile; real-world results will vary.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
