import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Stat } from "../components/ui/stat.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table.jsx";
import { Timeline } from "../components/ui/timeline.jsx";
import { Progress } from "../components/ui/progress.jsx";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const meta = {
  title: "Incident Postmortem — INC-2026-041",
  description: "Payment gateway outage on 2026-10-09: timeline, impact, root cause, and action items",
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

const timeline = [
  { date: "14:02", title: "Alert fired", description: "Payment success rate dropped below 95% SLO; PagerDuty page sent to on-call." },
  { date: "14:05", title: "On-call acknowledged", description: "Initial triage: error spike on /payments/charge, 502s from upstream gateway." },
  { date: "14:11", title: "Status page: investigating", description: "Public status updated. Traffic to gateway at 2.1× baseline." },
  { date: "14:24", title: "Hypothesis: upstream timeout", description: "Gateway p99 latency 4.8s (baseline 400ms). Suspect provider-side degradation." },
  { date: "14:31", title: "Root cause identified", description: "A mis-deployed retry config amplified load: retries without backoff created a thundering herd." },
  { date: "14:47", title: "Mitigation: roll back retry config", description: "Rolled back to previous config; error rate began declining." },
  { date: "15:03", title: "Status page: monitoring", description: "Success rate recovered to 99.2%; watching for recurrence." },
  { date: "15:10", title: "Incident resolved", description: "All metrics back within SLO for 15+ minutes. Incident declared resolved." },
  { date: "15:40", title: "Comms sent", description: "Customer and internal comms drafted; support macro updated." },
];

const impactWindow = [
  { t: "13:50", qps: 820, err: 0.4 },
  { t: "14:00", qps: 840, err: 0.5 },
  { t: "14:05", qps: 1720, err: 18.2 },
  { t: "14:10", qps: 1980, err: 34.6 },
  { t: "14:15", qps: 2140, err: 41.3 },
  { t: "14:20", qps: 2080, err: 38.9 },
  { t: "14:30", qps: 1890, err: 29.4 },
  { t: "14:45", qps: 1240, err: 9.8 },
  { t: "14:55", qps: 940, err: 2.1 },
  { t: "15:05", qps: 860, err: 0.7 },
  { t: "15:15", qps: 830, err: 0.4 },
];

const affected = [
  { name: "Web checkout", value: 46 },
  { name: "Mobile app", value: 31 },
  { name: "API partners", value: 17 },
  { name: "Internal tools", value: 6 },
];
const affectedColors = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-5)"];

const actionItems = [
  { id: "AI-1", action: "Add exponential backoff + jitter to all upstream retries", owner: "Payments", due: "2026-10-21", status: "In progress" },
  { id: "AI-2", action: "Cap retry multiplier; circuit-break on 5xx from gateway", owner: "Platform", due: "2026-10-24", status: "In progress" },
  { id: "AI-3", action: "Alert on retry-amplification ratio (retry QPS / base QPS)", owner: "SRE", due: "2026-10-18", status: "Done" },
  { id: "AI-4", action: "Load-test retry config changes in staging before deploy", owner: "Payments", due: "2026-11-01", status: "Open" },
  { id: "AI-5", action: "Document runbook: gateway degradation response", owner: "SRE", due: "2026-10-28", status: "Open" },
];

const statusVariant = { Done: "success", "In progress": "warning", Open: "secondary" };

export default function Report() {
  const done = actionItems.filter((a) => a.status === "Done").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Duration" value="68 min" hint="14:02 → 15:10" tone="destructive" />
        <Stat label="Failed charges" value="12,480" hint="est." tone="destructive" />
        <Stat label="Peak error rate" value="41.3%" tone="destructive" />
        <Stat label="SLA credits owed" value="$8,200" tone="warning" hint="est." />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">
            A mis-deployed retry configuration on the payment service caused a <b>thundering-herd retry storm</b>{" "}
            against the upstream gateway at 14:02. Retries without backoff amplified traffic to ~2.1× baseline,
            degrading the gateway and failing <b>~12,480 charges</b> over 68 minutes. Rolling back the retry config
            at 14:47 restored service; full SLO recovery by 15:10.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>All times UTC</CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline items={timeline} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic & errors during incident</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={impactWindow} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid {...grid} />
                  <XAxis dataKey="t" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="l" tick={axisTick} axisLine={false} tickLine={false} width={44} />
                  <YAxis yAxisId="r" orientation="right" tick={axisTick} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--color-chart-tick)" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line yAxisId="l" type="monotone" dataKey="qps" name="QPS" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 2 }} />
                  <Line yAxisId="r" type="monotone" dataKey="err" name="Error %" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Impact by surface</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={affected} dataKey="value" nameKey="name" innerRadius={40} outerRadius={68} paddingAngle={2}>
                    {affected.map((_, i) => (
                      <Cell key={i} fill={affectedColors[i % affectedColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Root cause</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm leading-relaxed">
            <p>
              <b>Primary:</b> A config change increased the upstream retry count from 2 to 5 <i>without</i> adding
              exponential backoff or jitter. Under gateway latency, this multiplied request volume and triggered a
              self-reinforcing retry storm.
            </p>
            <p>
              <b>Contributing:</b> No circuit breaker on 5xx responses; no alert on retry-amplification ratio, so the
              storm was only caught by the downstream success-rate SLO (a lagging signal).
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Action items</CardTitle>
          <CardDescription>
            {done}/{actionItems.length} complete
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={(done / actionItems.length) * 100} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actionItems.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{a.id}</TableCell>
                  <TableCell className="font-medium">{a.action}</TableCell>
                  <TableCell>{a.owner}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{a.due}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Incident INC-2026-041, 2026-10-09. Figures are demo data. SLA credit estimate based on affected enterprise
        contracts.
      </p>
    </div>
  );
}
