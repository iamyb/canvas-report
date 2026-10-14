import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Stat } from "../components/ui/stat.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.jsx";
import { ScoreBar } from "../components/ui/score-bar.jsx";
import { useSort } from "../components/ui/use-sort.js";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export const meta = {
  title: "SaaS Growth Dashboard — FY2026 H1",
  description: "MRR trajectory, churn analysis, NRR by cohort, and unit economics for a B2B SaaS (Series B)",
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

const fmtK = (n) => `$${(n / 1000).toFixed(0)}k`;

// Monthly MRR + churn (Jan–Jun 2026)
const mrrTrend = [
  { month: "Jan", mrr: 482000, newMrr: 38000, expansion: 12400, churn: 8200, logoChurn: 2.1 },
  { month: "Feb", mrr: 511000, newMrr: 42000, expansion: 13800, churn: 9100, logoChurn: 2.3 },
  { month: "Mar", mrr: 548000, newMrr: 45000, expansion: 15200, churn: 10400, logoChurn: 2.4 },
  { month: "Apr", mrr: 589000, newMrr: 48000, expansion: 16800, churn: 11200, logoChurn: 2.2 },
  { month: "May", mrr: 634000, newMrr: 52000, expansion: 18400, churn: 12100, logoChurn: 2.0 },
  { month: "Jun", mrr: 682000, newMrr: 56000, expansion: 20100, churn: 12800, logoChurn: 1.9 },
];

// NRR by cohort (quarter of signup)
const nrrByCohort = [
  { cohort: "Q1'25", nrr: 131, accounts: 42 },
  { cohort: "Q2'25", nrr: 124, accounts: 58 },
  { cohort: "Q3'25", nrr: 118, accounts: 73 },
  { cohort: "Q4'25", nrr: 112, accounts: 89 },
  { cohort: "Q1'26", nrr: 108, accounts: 96 },
  { cohort: "Q2'26", nrr: 104, accounts: 64 },
];

// Churn by segment
const churnBySegment = [
  { segment: "Enterprise (>$50k ARR)", logoChurn: 0.8, revChurn: 1.2, accounts: 24 },
  { segment: "Mid-market ($10–50k)", logoChurn: 2.4, revChurn: 3.1, accounts: 87 },
  { segment: "SMB (<$10k)", logoChurn: 5.8, revChurn: 7.4, accounts: 234 },
  { segment: "Trial → Paid", logoChurn: 12.3, revChurn: 0, accounts: 412 },
];

// Unit economics
const unitEconomics = [
  { metric: "ACV (new)", value: "$24,800", benchmark: "$18–30k", status: "On track" },
  { metric: "CAC (blended)", value: "$8,200", benchmark: "$6–12k", status: "On track" },
  { metric: "LTV:CAC", value: "4.2×", benchmark: "≥ 3×", status: "Healthy" },
  { metric: "CAC payback", value: "9.4 mo", benchmark: "≤ 12 mo", status: "Healthy" },
  { metric: "Gross margin", value: "78%", benchmark: "≥ 70%", status: "Healthy" },
  { metric: "Rule of 40", value: "34%", benchmark: "≥ 40%", status: "Below" },
];

const statusVariant = { Healthy: "success", "On track": "success", Below: "warning" };

// Top accounts by expansion
const topExpansion = [
  { account: "Acme Corp", segment: "Enterprise", mrr: 42000, expansion: 18000, yoy: 74 },
  { account: "Globex", segment: "Enterprise", mrr: 38000, expansion: 14200, yoy: 59 },
  { account: "Initech", segment: "Mid-market", mrr: 22000, expansion: 9800, yoy: 81 },
  { account: "Umbrella", segment: "Mid-market", mrr: 18000, expansion: 7400, yoy: 69 },
  { account: "Stark Ind.", segment: "Enterprise", mrr: 35000, expansion: 6200, yoy: 22 },
  { account: "Wayne Ent.", segment: "Mid-market", mrr: 15000, expansion: 5800, yoy: 63 },
  { account: "Hooli", segment: "SMB", mrr: 6200, expansion: 3400, yoy: 121 },
  { account: "Pied Piper", segment: "SMB", mrr: 4800, expansion: 2900, yoy: 154 },
];

export default function Report() {
  const { sorted, sort, toggle } = useSort(topExpansion, { key: "expansion", dir: "desc" });
  const sortIcon = (key) => (sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="MRR (Jun)" value="$682k" delta={7.9} deltaLabel="MoM" tone="success" sparkline={mrrTrend.map((m) => m.mrr)} />
        <Stat label="Net Revenue Retention" value="118%" hint="trailing 12mo" tone="success" sparkline={nrrByCohort.map((c) => c.nrr)} sparklineColor="var(--color-chart-2)" />
        <Stat label="Logo churn (Jun)" value="1.9%" delta={-0.5} deltaLabel="vs Jan" tone="success" sparkline={mrrTrend.map((m) => m.logoChurn)} sparklineColor="var(--color-chart-4)" />
        <Stat label="Rule of 40" value="34%" tone="warning" hint="target ≥ 40%" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key findings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
            <li>
              MRR grew <b className="text-success">+41% in H1</b> ($482k → $682k), with expansion revenue now
              contributing 30% of net new MRR (up from 26% in Jan).
            </li>
            <li>
              NRR is <b>declining by cohort</b> (131% → 104%): newer cohorts expand less, likely due to lower ACV
              mix. If the trend continues, NRR crosses 100% by Q4'26.
            </li>
            <li>
              <b>Rule of 40 at 34%</b> (target ≥ 40%): growth is strong (38%) but CAC payback (9.4 mo) and SMB churn
              (5.8%) are dragging. Shifting sales focus to mid-market is the highest-leverage fix.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Tabs defaultValue="growth">
        <TabsList>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="churn">Churn</TabsTrigger>
          <TabsTrigger value="nrr">NRR</TabsTrigger>
          <TabsTrigger value="economics">Unit economics</TabsTrigger>
          <TabsTrigger value="accounts">Top accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>MRR waterfall</CardTitle>
              <CardDescription>Jan–Jun 2026: new + expansion − churn</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mrrTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...grid} />
                  <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} width={52} tickFormatter={fmtK} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--color-chart-tick)" }} formatter={(v) => fmtK(v)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="mrr" name="Total MRR" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#mrrFill)" />
                  <Area type="monotone" dataKey="newMrr" name="New" stroke="var(--color-chart-2)" strokeWidth={1.5} fill="none" />
                  <Area type="monotone" dataKey="expansion" name="Expansion" stroke="var(--color-chart-5)" strokeWidth={1.5} fill="none" />
                  <Area type="monotone" dataKey="churn" name="Churn" stroke="var(--color-chart-4)" strokeWidth={1.5} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="churn">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Logo churn by segment</CardTitle>
                <CardDescription>Monthly, Jun 2026</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={churnBySegment} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="segment" tick={{ fill: "var(--color-chart-tick)", fontSize: 11 }} axisLine={false} tickLine={false} width={160} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                    <Bar dataKey="logoChurn" name="Logo churn" radius={[0, 4, 4, 0]} barSize={20}>
                      {churnBySegment.map((_, i) => (
                        <Cell key={i} fill={["var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"][i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Churn trend</CardTitle>
                <CardDescription>Logo churn %, Jan–Jun</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={mrrTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid {...grid} />
                    <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} tickFormatter={(v) => `${v}%`} domain={[0, 4]} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--color-chart-tick)" }} formatter={(v) => `${v}%`} />
                    <Line type="monotone" dataKey="logoChurn" name="Logo churn" stroke="var(--color-chart-4)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="nrr">
          <Card>
            <CardHeader>
              <CardTitle>NRR by signup cohort</CardTitle>
              <CardDescription>Declining trend: newer cohorts expand less (lower ACV mix)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={nrrByCohort} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid {...grid} />
                  <XAxis dataKey="cohort" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${v}%`} domain={[90, 140]} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                  <Bar dataKey="nrr" name="NRR" radius={[4, 4, 0, 0]} barSize={40}>
                    {nrrByCohort.map((d, i) => (
                      <Cell key={i} fill={d.nrr >= 110 ? "var(--color-chart-2)" : d.nrr >= 100 ? "var(--color-chart-3)" : "var(--color-chart-4)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="mt-3 text-xs text-muted-foreground">
                Green ≥ 110% (healthy), Yellow 100–110% (watch), Red &lt; 100% (contracting).
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="economics">
          <Card>
            <CardHeader>
              <CardTitle>Unit economics</CardTitle>
              <CardDescription>Blended, trailing 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Benchmark</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unitEconomics.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.metric}</TableCell>
                      <TableCell className="tabular-nums">{r.value}</TableCell>
                      <TableCell className="text-muted-foreground">{r.benchmark}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <ScoreBar label="Rule of 40 (target ≥ 40%)" value={34} good={40} warn={30} />
                <ScoreBar label="Gross margin (target ≥ 70%)" value={78} good={70} warn={60} />
                <ScoreBar label="NRR (target ≥ 110%)" value={118} good={110} warn={100} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Top accounts by expansion</CardTitle>
              <CardDescription>Click a column header to sort</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => toggle("account")} className="cursor-pointer">Account{sortIcon("account")}</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead onClick={() => toggle("mrr")} className="cursor-pointer text-right">MRR{sortIcon("mrr")}</TableHead>
                    <TableHead onClick={() => toggle("expansion")} className="cursor-pointer text-right">Expansion{sortIcon("expansion")}</TableHead>
                    <TableHead onClick={() => toggle("yoy")} className="cursor-pointer text-right">YoY %{sortIcon("yoy")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.account}</TableCell>
                      <TableCell>
                        <Badge variant={r.segment === "Enterprise" ? "default" : r.segment === "Mid-market" ? "secondary" : "outline"}>
                          {r.segment}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{fmtK(r.mrr)}</TableCell>
                      <TableCell className="text-right tabular-nums text-success">+{fmtK(r.expansion)}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.yoy}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground">
        Source: Billing system + CRM export, 2026-01-01 → 2026-06-30. 405 paying accounts.
        NRR = (starting MRR + expansion − contraction − churn) / starting MRR. Figures are demo data.
      </p>
    </div>
  );
}
