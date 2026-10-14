import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Stat } from "../components/ui/stat.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.jsx";
import { useSort } from "../components/ui/use-sort.js";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
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
  title: "Cloud Cost Audit — Q3 2026",
  description: "Monthly spend breakdown, top services, and optimization opportunities across all projects",
  badges: [{ label: "Demo data", variant: "warning" }],
  palette: "warm",
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

const monthly = [
  { month: "Apr", compute: 42100, database: 28400, storage: 9800, network: 6200 },
  { month: "May", compute: 44800, database: 29100, storage: 10400, network: 6800 },
  { month: "Jun", compute: 47300, database: 31200, storage: 11100, network: 7400 },
  { month: "Jul", compute: 51900, database: 33800, storage: 12600, network: 8100 },
  { month: "Aug", compute: 55400, database: 36200, storage: 13900, network: 9300 },
  { month: "Sep", compute: 58700, database: 38900, storage: 15200, network: 10800 },
];

const share = [
  { name: "Compute", value: 58700 },
  { name: "Database", value: 38900 },
  { name: "Storage", value: 15200 },
  { name: "Network", value: 10800 },
  { name: "Other", value: 6400 },
];
const shareColors = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-5)", "var(--color-chart-6)"];

const topServices = [
  { name: "ECS / VM", cost: 31200 },
  { name: "RDS", cost: 24600 },
  { name: "Object Storage", cost: 12800 },
  { name: "Redis", cost: 9400 },
  { name: "Kafka", cost: 7200 },
  { name: "CDN", cost: 6100 },
  { name: "Load Balancer", cost: 4800 },
  { name: "Elasticsearch", cost: 4200 },
  { name: "Data Warehouse", cost: 3900 },
  { name: "Container Registry", cost: 2100 },
];

const lineItems = [
  { service: "ECS / VM", project: "prod-api", region: "us-east-1", cost: 18400, delta: 12.4, status: "High" },
  { service: "RDS", project: "prod-api", region: "us-east-1", cost: 14200, delta: 8.1, status: "High" },
  { service: "Object Storage", project: "media", region: "us-east-1", cost: 9800, delta: 22.6, status: "High" },
  { service: "Redis", project: "prod-api", region: "us-east-1", cost: 6200, delta: -3.2, status: "Normal" },
  { service: "Kafka", project: "events", region: "us-west-2", cost: 5400, delta: 15.8, status: "High" },
  { service: "CDN", project: "media", region: "global", cost: 4900, delta: 6.4, status: "Normal" },
  { service: "ECS / VM", project: "staging", region: "us-east-1", cost: 4800, delta: 0, status: "Idle" },
  { service: "Load Balancer", project: "prod-api", region: "us-east-1", cost: 3600, delta: 2.1, status: "Normal" },
  { service: "Elasticsearch", project: "search", region: "us-west-2", cost: 3100, delta: 18.9, status: "High" },
  { service: "Data Warehouse", project: "analytics", region: "us-east-1", cost: 2900, delta: 31.2, status: "High" },
  { service: "RDS", project: "staging", region: "us-east-1", cost: 2400, delta: 0, status: "Idle" },
  { service: "Redis", project: "staging", region: "us-east-1", cost: 1800, delta: 0, status: "Idle" },
  { service: "Kafka", project: "staging", region: "us-west-2", cost: 1600, delta: 0, status: "Idle" },
  { service: "Object Storage", project: "backups", region: "us-west-2", cost: 3000, delta: 4.5, status: "Normal" },
  { service: "Container Registry", project: "ci", region: "us-east-1", cost: 1400, delta: -1.8, status: "Normal" },
  { service: "ECS / VM", project: "ci", region: "us-east-1", cost: 3200, delta: 9.7, status: "Normal" },
  { service: "Data Warehouse", project: "staging", region: "us-east-1", cost: 1000, delta: 0, status: "Idle" },
  { service: "CDN", project: "staging", region: "global", cost: 1200, delta: 0, status: "Idle" },
  { service: "Elasticsearch", project: "staging", region: "us-west-2", cost: 1100, delta: 0, status: "Idle" },
  { service: "Load Balancer", project: "staging", region: "us-east-1", cost: 1200, delta: 0, status: "Idle" },
];

const statusVariant = { High: "destructive", Normal: "success", Idle: "warning" };

const optimizations = [
  { action: "Convert 6 prod ECS to reserved instances", saving: 11800, effort: "Low", impact: "Monthly" },
  { action: "Right-size 3 over-provisioned RDS instances", saving: 6400, effort: "Medium", impact: "Monthly" },
  { action: "Delete idle staging cluster (8 resources)", saving: 11100, effort: "Low", impact: "One-time + monthly" },
  { action: "Enable lifecycle policy on backup storage", saving: 2900, effort: "Low", impact: "Monthly" },
  { action: "Compress cold Object Storage to archive tier", saving: 4200, effort: "Medium", impact: "Monthly" },
];

const fmt = (n) => "$" + n.toLocaleString("en-US");

export default function Report() {
  const { sorted, sort, toggle } = useSort(lineItems, { key: "cost", dir: "desc" });
  const sortIcon = (key) => (sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "");
  const totalSavings = optimizations.reduce((s, o) => s + o.saving, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total spend (Sep)" value={fmt(129000)} delta={11.3} deltaLabel="vs Aug" tone="destructive" />
        <Stat label="Top service share" value="45.5%" hint="Compute" />
        <Stat label="Idle resources" value="8" hint="staging" tone="warning" />
        <Stat label="Est. monthly savings" value={fmt(totalSavings)} tone="success" hint="if all applied" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key findings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
            <li>
              Spend grew <b className="text-destructive">+11.3% MoM</b>, driven mostly by Compute and Data Warehouse —
              both tracking above the Q3 budget envelope.
            </li>
            <li>
              The <b>staging environment</b> runs 8 idle resources with zero traffic; deleting them saves ~
              {fmt(11100)}/mo with no production impact.
            </li>
            <li>
              Converting the 6 largest prod ECS to <b>reserved instances</b> is the single highest-leverage action
              ({fmt(11800)}/mo, low effort).
            </li>
          </ul>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">By service</TabsTrigger>
          <TabsTrigger value="lineitems">Line items</TabsTrigger>
          <TabsTrigger value="optimize">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly spend by category</CardTitle>
                <CardDescription>Apr – Sep 2026</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid {...grid} />
                    <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis tick={axisTick} axisLine={false} tickLine={false} width={52} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--color-chart-tick)" }} formatter={(v) => fmt(v)} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="compute" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="database" stroke="var(--color-chart-2)" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="storage" stroke="var(--color-chart-3)" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="network" stroke="var(--color-chart-5)" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spend share by category</CardTitle>
                <CardDescription>September 2026</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={share} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {share.map((_, i) => (
                        <Cell key={i} fill={shareColors[i % shareColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(v)} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 services by cost</CardTitle>
              <CardDescription>September 2026</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={topServices} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <YAxis type="category" dataKey="name" tick={axisTick} axisLine={false} tickLine={false} width={120} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(v)} />
                  <Bar dataKey="cost" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lineitems">
          <Card>
            <CardHeader>
              <CardTitle>Line items</CardTitle>
              <CardDescription>Click a column header to sort</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => toggle("service")} className="cursor-pointer">Service{sortIcon("service")}</TableHead>
                    <TableHead onClick={() => toggle("project")} className="cursor-pointer">Project{sortIcon("project")}</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead onClick={() => toggle("cost")} className="cursor-pointer text-right">Cost{sortIcon("cost")}</TableHead>
                    <TableHead onClick={() => toggle("delta")} className="cursor-pointer text-right">MoM{sortIcon("delta")}</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.service}</TableCell>
                      <TableCell>{r.project}</TableCell>
                      <TableCell className="text-muted-foreground">{r.region}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmt(r.cost)}</TableCell>
                      <TableCell className={`text-right tabular-nums ${r.delta > 0 ? "text-destructive" : r.delta < 0 ? "text-success" : "text-muted-foreground"}`}>
                        {r.delta === 0 ? "—" : `${r.delta > 0 ? "+" : ""}${r.delta.toFixed(1)}%`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimize">
          <Card>
            <CardHeader>
              <CardTitle>Optimization opportunities</CardTitle>
              <CardDescription>Estimated {fmt(totalSavings)}/mo total if all applied</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Effort</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead className="text-right">Est. saving / mo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {optimizations.map((o, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{o.action}</TableCell>
                      <TableCell>
                        <Badge variant={o.effort === "Low" ? "success" : "warning"}>{o.effort}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{o.impact}</TableCell>
                      <TableCell className="text-right tabular-nums text-success">{fmt(o.saving)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground">
        Source: cloud billing export, 2026-04-01 → 2026-09-30. Figures are demo data. Savings are estimates and
        exclude tax / discount variance.
      </p>
    </div>
  );
}
