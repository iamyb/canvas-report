import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Stat } from "../components/ui/stat.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.jsx";
import { Timeline } from "../components/ui/timeline.jsx";
import { Progress } from "../components/ui/progress.jsx";
import { useSort } from "../components/ui/use-sort.js";
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
  title: "Project Health Report",
  description: "Example report: demonstrates all components — KPIs, charts, tables, timeline (data is illustrative)",
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

const traffic = [
  { name: "Mon", api: 12400, web: 8600 },
  { name: "Tue", api: 13800, web: 9200 },
  { name: "Wed", api: 11900, web: 8100 },
  { name: "Thu", api: 15200, web: 9800 },
  { name: "Fri", api: 16100, web: 10400 },
  { name: "Sat", api: 9800, web: 6200 },
  { name: "Sun", api: 8700, web: 5600 },
];

const share = [
  { name: "api", value: 45 },
  { name: "web", value: 30 },
  { name: "worker", value: 18 },
  { name: "other", value: 7 },
];
const shareColors = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-5)"];

const services = [
  { name: "auth", p99: 182, errorRate: 0.4, uptime: 99.98 },
  { name: "billing", p99: 421, errorRate: 1.2, uptime: 99.91 },
  { name: "search", p99: 356, errorRate: 0.8, uptime: 99.95 },
  { name: "worker", p99: 512, errorRate: 2.1, uptime: 99.87 },
  { name: "gateway", p99: 96, errorRate: 0.2, uptime: 99.99 },
];

const changes = [
  { date: "2026-10-14 09:12", title: "Connection pool max raised from 50 to 200", description: "web module P99 dropped ~8%" },
  { date: "2026-10-13 18:40", title: "Released v2.31.0", description: "Added rate-limiting middleware; retry without backoff caused a localized error-rate spike" },
  { date: "2026-10-12 11:05", title: "Worker scale-up request rejected", description: "Queue peaked at ~40min backlog, pending re-evaluation" },
  { date: "2026-10-11 16:22", title: "Database index optimization", description: "search slow queries dropped from 34/day to 6/day" },
];

export default function Report() {
  const { sorted, sort, toggle } = useSort(services, { key: "p99", dir: "desc" });
  const sortIcon = (key) => (sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Weekly requests" value="96.4k" delta={12.5} deltaLabel="vs last week" />
        <Stat label="P99 latency" value="231ms" delta={-8.2} deltaLabel="vs last week" tone="success" />
        <Stat label="Error rate" value="0.6%" delta={0.1} deltaLabel="vs last week" tone="warning" />
        <Stat label="Uptime" value="99.95%" tone="success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key findings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-4 text-sm text-foreground/90">
            <li>web module latency dropped 8%, mainly from the connection pool tuning (10-14).</li>
            <li>Worker queue peaked at a 40min backlog and the scale-up request was rejected — the biggest risk this week.</li>
            <li>v2.31.0 retry has no backoff, causing a localized error-rate spike; exponential backoff is recommended.</li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily request volume</CardTitle>
            <CardDescription>api vs web</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={traffic} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} width={48} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--color-chart-tick)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="api" name="api" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="web" name="web" stroke="var(--color-chart-2)" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request source share</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={share} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {share.map((_, i) => (
                    <Cell key={i} fill={shareColors[i % shareColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service metrics</CardTitle>
          <CardDescription>Click a header to sort</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggle("p99")}>
                  P99 (ms){sortIcon("p99")}
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggle("errorRate")}>
                  Error rate (%){" "}
                  {sortIcon("errorRate")}
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggle("uptime")}>
                  Uptime (%){" "}
                  {sortIcon("uptime")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((s) => (
                <TableRow key={s.name}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="tabular-nums">{s.p99}</TableCell>
                  <TableCell className={s.errorRate > 1 ? "text-destructive" : "text-foreground"}>
                    {s.errorRate.toFixed(1)}%
                  </TableCell>
                  <TableCell className="tabular-nums">{s.uptime.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Recent changes</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline">
          <Card>
            <CardContent className="pt-5">
              <Timeline items={changes} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="quality">
          <Card>
            <CardContent className="space-y-4 pt-5">
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Test coverage</span>
                  <span>78%</span>
                </div>
                <Progress value={78} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Dependency vulnerabilities fixed</span>
                  <span>92%</span>
                </div>
                <Progress value={92} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
