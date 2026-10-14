import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Stat } from "../components/ui/stat.jsx";
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
  AreaChart,
  Area,
  Cell,
} from "recharts";

export const meta = {
  title: "API Performance Review — v2.31",
  description: "Latency percentiles, error rates, and before/after comparison of the connection-pool change",
  badges: [{ label: "Demo data", variant: "warning" }],
  updatedAt: "2026-10-14 10:30",
};

const tooltipStyle = {
  backgroundColor: "var(--color-chart-tooltip-bg)",
  border: "1px solid var(--color-chart-tooltip-border)",
  borderRadius: 8,
  color: "var(--color-chart-tooltip-fg)",
};
const axisTick = { fill: "var(--color-chart-tick)", fontSize: 12 };
const grid = { stroke: "var(--color-chart-grid)", strokeDasharray: "3 3", vertical: false };

const P99_SLO = 300; // ms

const endpoints = [
  { name: "GET /orders", p50: 42, p95: 128, p99: 214, err: 0.21, timeout: 0.02 },
  { name: "POST /orders", p50: 88, p95: 240, p99: 402, err: 0.64, timeout: 0.11 },
  { name: "GET /search", p50: 61, p95: 190, p99: 356, err: 0.82, timeout: 0.19 },
  { name: "GET /products", p50: 35, p95: 96, p99: 168, err: 0.14, timeout: 0.01 },
  { name: "POST /checkout", p50: 132, p95: 380, p99: 611, err: 1.42, timeout: 0.34 },
  { name: "GET /user", p50: 28, p95: 74, p99: 121, err: 0.09, timeout: 0.01 },
  { name: "POST /auth/login", p50: 96, p95: 260, p99: 448, err: 0.91, timeout: 0.22 },
  { name: "GET /reports", p50: 210, p95: 540, p99: 890, err: 2.10, timeout: 0.61 },
];

const errorTrend = [
  { day: "10-01", rate: 0.42 },
  { day: "10-02", rate: 0.48 },
  { day: "10-03", rate: 0.51 },
  { day: "10-04", rate: 0.47 },
  { day: "10-05", rate: 0.55 },
  { day: "10-06", rate: 0.62 },
  { day: "10-07", rate: 0.58 },
  { day: "10-08", rate: 0.71 },
  { day: "10-09", rate: 0.84 },
  { day: "10-10", rate: 0.79 },
  { day: "10-11", rate: 0.66 },
  { day: "10-12", rate: 0.52 },
  { day: "10-13", rate: 0.44 },
  { day: "10-14", rate: 0.38 },
];

const beforeAfter = [
  { name: "GET /orders", before: 268, after: 214 },
  { name: "POST /orders", before: 455, after: 402 },
  { name: "GET /search", before: 402, after: 356 },
  { name: "POST /checkout", before: 688, after: 611 },
  { name: "POST /auth/login", before: 512, after: 448 },
  { name: "GET /reports", before: 940, after: 890 },
];

const fmtMs = (n) => `${n}ms`;

export default function Report() {
  const { sorted, sort, toggle } = useSort(endpoints, { key: "p99", dir: "desc" });
  const sortIcon = (key) => (sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "");
  const overSlo = endpoints.filter((e) => e.p99 > P99_SLO);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Fleet P99" value="312ms" delta={-6.4} deltaLabel="vs v2.30" tone="success" />
        <Stat label="Fleet error rate" value="0.74%" delta={-0.12} deltaLabel="vs v2.30" tone="success" />
        <Stat label="Endpoints over SLO" value={`${overSlo.length}/${endpoints.length}`} hint={`P99 > ${P99_SLO}ms`} tone="warning" />
        <Stat label="Timeout rate" value="0.18%" tone="default" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key findings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
            <li>
              The connection-pool change (max 50 → 200) cut fleet P99 by <b className="text-success">6.4%</b> with no
              error-rate regression.
            </li>
            <li>
              <b>{overSlo.length} of {endpoints.length} endpoints</b> still breach the {P99_SLO}ms P99 SLO —{" "}
              <code className="text-xs">GET /reports</code> and <code className="text-xs">POST /checkout</code> are the
              worst offenders.
            </li>
            <li>
              <code className="text-xs">GET /reports</code> pairs the highest latency with the highest error rate
              (2.10%) — likely a slow aggregation query, not a capacity issue.
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>P99 latency by endpoint</CardTitle>
            <CardDescription>Red bars exceed the {P99_SLO}ms SLO</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={endpoints} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}ms`} />
                <YAxis type="category" dataKey="name" tick={{ fill: "var(--color-chart-tick)", fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtMs(v)} />
                <Bar dataKey="p99" radius={[0, 4, 4, 0]} barSize={16}>
                  {endpoints.map((e, i) => (
                    <Cell key={i} fill={e.p99 > P99_SLO ? "#ef4444" : "var(--color-chart-1)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fleet error rate</CardTitle>
            <CardDescription>Last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={errorTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="errFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...grid} />
                <XAxis dataKey="day" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                <Area type="monotone" dataKey="rate" stroke="var(--color-chart-3)" strokeWidth={2} fill="url(#errFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Before / after — P99 by endpoint</CardTitle>
          <CardDescription>v2.30 (before) vs v2.31 (after) the connection-pool change</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={beforeAfter} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...grid} />
              <XAxis dataKey="name" tick={{ fill: "var(--color-chart-tick)", fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-12} textAnchor="end" height={50} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => `${v}ms`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtMs(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="before" name="v2.30" fill="#8b95a7" radius={[4, 4, 0, 0]} barSize={14} />
              <Bar dataKey="after" name="v2.31" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endpoint matrix</CardTitle>
          <CardDescription>Click a column header to sort</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => toggle("name")} className="cursor-pointer">Endpoint{sortIcon("name")}</TableHead>
                <TableHead onClick={() => toggle("p50")} className="cursor-pointer text-right">P50{sortIcon("p50")}</TableHead>
                <TableHead onClick={() => toggle("p95")} className="cursor-pointer text-right">P95{sortIcon("p95")}</TableHead>
                <TableHead onClick={() => toggle("p99")} className="cursor-pointer text-right">P99{sortIcon("p99")}</TableHead>
                <TableHead onClick={() => toggle("err")} className="cursor-pointer text-right">Error %{sortIcon("err")}</TableHead>
                <TableHead onClick={() => toggle("timeout")} className="cursor-pointer text-right">Timeout %{sortIcon("timeout")}</TableHead>
                <TableHead>SLO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.p50}ms</TableCell>
                  <TableCell className="text-right tabular-nums">{r.p95}ms</TableCell>
                  <TableCell className={`text-right tabular-nums ${r.p99 > P99_SLO ? "text-destructive font-semibold" : ""}`}>{r.p99}ms</TableCell>
                  <TableCell className={`text-right tabular-nums ${r.err > 1 ? "text-destructive" : ""}`}>{r.err.toFixed(2)}%</TableCell>
                  <TableCell className="text-right tabular-nums">{r.timeout.toFixed(2)}%</TableCell>
                  <TableCell>
                    <Badge variant={r.p99 > P99_SLO ? "destructive" : "success"}>{r.p99 > P99_SLO ? "Breach" : "OK"}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Source: APM traces, 2026-10-01 → 2026-10-14. Percentiles computed over 14-day window. Figures are demo data.
      </p>
    </div>
  );
}
