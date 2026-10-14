import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Stat } from "../components/ui/stat.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.jsx";
import { Callout } from "../components/ui/callout.jsx";
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
  title: "DevOps Maturity Assessment — Q3 2026",
  description: "DORA four key metrics across 6 teams, AI adoption impact, and improvement roadmap",
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

// DORA benchmarks (2024 report): Elite / High / Medium / Low
const doraBenchmarks = {
  deployFreq: { elite: "On-demand", high: "Multiple/day", medium: "Weekly", low: "Monthly+" },
  leadTime: { elite: "< 1 hour", high: "< 1 day", medium: "1–10 days", low: "2–6 weeks" },
  changeFail: { elite: "< 5%", high: "5–10%", medium: "10–20%", low: "> 20%" },
  recovery: { elite: "< 1 hour", high: "< 1 day", medium: "1–10 days", low: "> 10 days" },
};

const teams = [
  { team: "Platform", deployFreq: 12, leadTime: 0.4, changeFail: 3.2, recovery: 0.8, tier: "Elite" },
  { team: "Payments", deployFreq: 6, leadTime: 1.2, changeFail: 7.8, recovery: 2.1, tier: "High" },
  { team: "Search", deployFreq: 4, leadTime: 2.5, changeFail: 12.4, recovery: 5.3, tier: "Medium" },
  { team: "Mobile", deployFreq: 3, leadTime: 3.8, changeFail: 15.1, recovery: 8.7, tier: "Medium" },
  { team: "Data Eng", deployFreq: 2, leadTime: 6.2, changeFail: 18.6, recovery: 12.4, tier: "Low" },
  { team: "Legacy CRM", deployFreq: 1, leadTime: 14.0, changeFail: 24.3, recovery: 18.2, tier: "Low" },
];

const tierVariant = { Elite: "success", High: "success", Medium: "warning", Low: "destructive" };

// Monthly trend for org-wide metrics (last 6 months)
const trend = [
  { month: "Apr", deployFreq: 4.2, leadTime: 4.8, changeFail: 14.2, recovery: 7.8 },
  { month: "May", deployFreq: 4.5, leadTime: 4.2, changeFail: 13.8, recovery: 7.1 },
  { month: "Jun", deployFreq: 4.8, leadTime: 3.9, changeFail: 13.1, recovery: 6.4 },
  { month: "Jul", deployFreq: 5.1, leadTime: 3.4, changeFail: 12.6, recovery: 5.8 },
  { month: "Aug", deployFreq: 5.4, leadTime: 3.1, changeFail: 11.9, recovery: 5.2 },
  { month: "Sep", deployFreq: 5.7, leadTime: 2.8, changeFail: 11.2, recovery: 4.6 },
];

// AI adoption impact (2024 DORA finding: productivity up, stability down)
const aiImpact = [
  { metric: "Individual productivity", before: 100, after: 128, unit: "index" },
  { metric: "Flow state hours/week", before: 100, after: 134, unit: "index" },
  { metric: "Job satisfaction", before: 100, after: 119, unit: "index" },
  { metric: "Change stability", before: 100, after: 87, unit: "index" },
  { metric: "Throughput (deploys/wk)", before: 100, after: 94, unit: "index" },
  { metric: "Lead time (days)", before: 100, after: 108, unit: "index" },
];

const improvements = [
  { action: "Adopt trunk-based development in Data Eng + Legacy CRM", owner: "Platform", due: "2026-11-15", impact: "Lead time −40%", status: "In progress" },
  { action: "Add integration test gates to CI (target: < 10 min)", owner: "SRE", due: "2026-11-01", impact: "Change fail −30%", status: "In progress" },
  { action: "Implement feature flags for Mobile team", owner: "Mobile", due: "2026-11-30", impact: "Deploy freq ×2", status: "Open" },
  { action: "AI-assisted code review with stability guardrails", owner: "Platform", due: "2026-12-15", impact: "Productivity +, stability neutral", status: "Open" },
  { action: "Automated rollback for Payments (target: < 5 min)", owner: "Payments", due: "2026-11-20", impact: "Recovery −60%", status: "In progress" },
];

const statusVariant = { Done: "success", "In progress": "warning", Open: "secondary" };

export default function Report() {
  const { sorted, sort, toggle } = useSort(teams, { key: "leadTime", dir: "asc" });
  const sortIcon = (key) => (sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "");
  const done = improvements.filter((a) => a.status === "Done").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Org deploy frequency" value="5.7/wk" delta={35.7} deltaLabel="vs Apr" tone="success" />
        <Stat label="Org lead time" value="2.8 days" delta={-41.7} deltaLabel="vs Apr" tone="success" />
        <Stat label="Change fail rate" value="11.2%" delta={-21.1} deltaLabel="vs Apr" tone="success" />
        <Stat label="Recovery time" value="4.6 hrs" delta={-41.0} deltaLabel="vs Apr" tone="success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key findings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
            <li>
              Org-wide DORA metrics improved <b className="text-success">~40% over 6 months</b>, driven by Platform
              team's internal developer platform rollout.
            </li>
            <li>
              <b>2 of 6 teams</b> (Data Eng, Legacy CRM) remain in the "Low" tier — their lead times (6–14 days) are
              5–35× the org median. Trunk-based development is the highest-leverage fix.
            </li>
            <li>
              AI adoption (rolled out Jul) boosted individual productivity <b>+28%</b> but reduced change stability
              <b className="text-destructive"> −13%</b> — consistent with DORA 2024 findings. Guardrails needed before
              broader rollout.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Tabs defaultValue="teams">
        <TabsList>
          <TabsTrigger value="teams">By team</TabsTrigger>
          <TabsTrigger value="trend">6-month trend</TabsTrigger>
          <TabsTrigger value="ai">AI impact</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>Team DORA metrics</CardTitle>
              <CardDescription>Click a column header to sort. Tier based on DORA 2024 benchmarks.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => toggle("team")} className="cursor-pointer">Team{sortIcon("team")}</TableHead>
                    <TableHead onClick={() => toggle("deployFreq")} className="cursor-pointer text-right">Deploys/wk{sortIcon("deployFreq")}</TableHead>
                    <TableHead onClick={() => toggle("leadTime")} className="cursor-pointer text-right">Lead time (d){sortIcon("leadTime")}</TableHead>
                    <TableHead onClick={() => toggle("changeFail")} className="cursor-pointer text-right">Change fail %{sortIcon("changeFail")}</TableHead>
                    <TableHead onClick={() => toggle("recovery")} className="cursor-pointer text-right">Recovery (h){sortIcon("recovery")}</TableHead>
                    <TableHead>Tier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.team}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.deployFreq}</TableCell>
                      <TableCell className={`text-right tabular-nums ${r.leadTime > 10 ? "text-destructive font-semibold" : ""}`}>{r.leadTime.toFixed(1)}</TableCell>
                      <TableCell className={`text-right tabular-nums ${r.changeFail > 20 ? "text-destructive" : ""}`}>{r.changeFail.toFixed(1)}%</TableCell>
                      <TableCell className="text-right tabular-nums">{r.recovery.toFixed(1)}</TableCell>
                      <TableCell>
                        <Badge variant={tierVariant[r.tier]}>{r.tier}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Deploy frequency & lead time</CardTitle>
                <CardDescription>Org-wide, Apr–Sep 2026</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid {...grid} />
                    <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="l" tick={axisTick} axisLine={false} tickLine={false} width={36} />
                    <YAxis yAxisId="r" orientation="right" tick={axisTick} axisLine={false} tickLine={false} width={36} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--color-chart-tick)" }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line yAxisId="l" type="monotone" dataKey="deployFreq" name="Deploys/wk" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 2 }} />
                    <Line yAxisId="r" type="monotone" dataKey="leadTime" name="Lead time (d)" stroke="var(--color-chart-2)" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change fail rate & recovery</CardTitle>
                <CardDescription>Org-wide, Apr–Sep 2026</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid {...grid} />
                    <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="l" tick={axisTick} axisLine={false} tickLine={false} width={36} tickFormatter={(v) => `${v}%`} />
                    <YAxis yAxisId="r" orientation="right" tick={axisTick} axisLine={false} tickLine={false} width={36} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--color-chart-tick)" }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line yAxisId="l" type="monotone" dataKey="changeFail" name="Change fail %" stroke="var(--color-chart-4)" strokeWidth={2} dot={{ r: 2 }} />
                    <Line yAxisId="r" type="monotone" dataKey="recovery" name="Recovery (h)" stroke="var(--color-chart-5)" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI adoption impact (Jul rollout)</CardTitle>
              <CardDescription>Indexed to 100 = pre-AI baseline. Source: DORA 2024 + internal telemetry.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={aiImpact} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[80, 140]} tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="metric" tick={{ fill: "var(--color-chart-tick)", fontSize: 11 }} axisLine={false} tickLine={false} width={180} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="before" name="Before AI" fill="var(--color-chart-tick)" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="after" name="After AI" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} barSize={12}>
                    {aiImpact.map((d, i) => (
                      <Cell key={i} fill={d.after < 100 ? "var(--color-chart-4)" : "var(--color-chart-1)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <Callout tone="warning" title="Stability tradeoff" className="mt-3">
                Red bars = metric degraded. AI improved productivity/flow/satisfaction but reduced stability and
                throughput — consistent with DORA 2024: "AI brings clear benefits but unexpected tradeoffs."
                Guardrails (stability gates, rollback automation) are required before broader rollout.
              </Callout>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap">
          <Card>
            <CardHeader>
              <CardTitle>Improvement roadmap</CardTitle>
              <CardDescription>{done}/{improvements.length} complete</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Expected impact</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {improvements.map((a, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{a.action}</TableCell>
                      <TableCell>{a.owner}</TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">{a.due}</TableCell>
                      <TableCell className="text-xs">{a.impact}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground">
        Source: Internal CI/CD telemetry + DORA 2024 benchmarks. 6 teams, 2026-04-01 → 2026-09-30.
        AI impact indexed to pre-rollout baseline (Jun). Figures are demo data.
      </p>
    </div>
  );
}
