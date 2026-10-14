import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Stat } from "../components/ui/stat.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.jsx";
import { Progress } from "../components/ui/progress.jsx";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const meta = {
  title: "Dependency Security Audit",
  description: "Vulnerabilities, outdated packages, and license risk across the monorepo (142 direct deps)",
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

const severity = [
  { name: "Critical", value: 3 },
  { name: "High", value: 7 },
  { name: "Medium", value: 19 },
  { name: "Low", value: 34 },
];
const severityColors = ["#ef4444", "var(--color-chart-3)", "var(--color-chart-1)", "#8b95a7"];

const ageBuckets = [
  { name: "< 3 mo", count: 58 },
  { name: "3–6 mo", count: 41 },
  { name: "6–12 mo", count: 27 },
  { name: "1–2 yr", count: 12 },
  { name: "> 2 yr", count: 4 },
];

const vulns = [
  { pkg: "lodash", current: "4.17.21", latest: "4.17.21", sev: "High", cve: "CVE-2021-23337", fix: "Upgrade to 4.17.21+ / use lodash-es", direct: true },
  { pkg: "minimist", current: "1.2.5", latest: "1.2.8", sev: "Critical", cve: "CVE-2021-44906", fix: "Upgrade to 1.2.6+", direct: false },
  { pkg: "axios", current: "0.21.1", latest: "1.7.9", sev: "High", cve: "CVE-2021-3749", fix: "Upgrade to 0.21.2+ / 1.x", direct: true },
  { pkg: "node-fetch", current: "2.6.0", latest: "2.7.0", sev: "Medium", cve: "CVE-2022-0235", fix: "Upgrade to 2.6.1+", direct: true },
  { pkg: "tough-cookie", current: "2.4.3", latest: "4.1.4", sev: "High", cve: "CVE-2023-26136", fix: "Upgrade to 4.1.3+", direct: false },
  { pkg: "braces", current: "2.3.2", latest: "3.0.3", sev: "Critical", cve: "CVE-2024-4068", fix: "Upgrade to 3.0.3", direct: false },
  { pkg: "qs", current: "6.5.2", latest: "6.13.1", sev: "High", cve: "CVE-2022-24999", fix: "Upgrade to 6.5.3+", direct: false },
  { pkg: "serialize-javascript", current: "3.1.0", latest: "6.0.2", sev: "Medium", cve: "CVE-2020-8187", fix: "Upgrade to 4.0.0+", direct: false },
  { pkg: "webpack-dev-middleware", current: "3.7.0", latest: "7.4.2", sev: "Medium", cve: "CVE-2023-28154", fix: "Upgrade to 5.3.4+", direct: false },
  { pkg: "path-parse", current: "1.0.6", latest: "1.0.7", sev: "Low", cve: "CVE-2021-23343", fix: "Upgrade to 1.0.7", direct: false },
];

const sevVariant = { Critical: "destructive", High: "destructive", Medium: "warning", Low: "secondary" };

const outdated = [
  { pkg: "react", current: "18.2.0", latest: "18.3.1", age: "8 mo", risk: "Low" },
  { pkg: "vite", current: "5.0.8", latest: "6.3.5", age: "14 mo", risk: "Medium" },
  { pkg: "typescript", current: "5.0.4", latest: "5.7.2", age: "16 mo", risk: "Low" },
  { pkg: "tailwindcss", current: "3.3.3", latest: "4.1.11", age: "18 mo", risk: "Medium" },
  { pkg: "recharts", current: "2.6.2", latest: "2.15.0", age: "11 mo", risk: "Low" },
  { pkg: "eslint", current: "8.28.0", latest: "9.17.0", age: "20 mo", risk: "Medium" },
  { pkg: "jest", current: "29.3.1", latest: "29.7.0", age: "15 mo", risk: "Low" },
  { pkg: "prettier", current: "2.8.4", latest: "3.4.2", age: "19 mo", risk: "Low" },
];

const riskVariant = { Low: "secondary", Medium: "warning", High: "destructive" };

const licenses = [
  { name: "MIT", count: 96 },
  { name: "Apache-2.0", count: 28 },
  { name: "ISC", count: 11 },
  { name: "BSD-3", count: 4 },
  { name: "GPL-3.0", count: 2 },
  { name: "Unknown", count: 1 },
];
const licenseColors = ["var(--color-chart-2)", "var(--color-chart-1)", "var(--color-chart-6)", "var(--color-chart-5)", "#ef4444", "#8b95a7"];

export default function Report() {
  const { sorted, sort, toggle } = useSort(vulns, { key: "sev", dir: "asc" });
  const sortIcon = (key) => (sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "");
  const fixed = 12;
  const total = 63;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Direct dependencies" value="142" />
        <Stat label="Open vulnerabilities" value="63" delta={-8.3} deltaLabel="vs last week" tone="destructive" />
        <Stat label="Critical / High" value="10" tone="destructive" hint="need action" />
        <Stat label="Outdated packages" value="37" tone="warning" hint="behind latest" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key findings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
            <li>
              <b>3 critical vulnerabilities</b> are all in transitive deps (<code className="text-xs">minimist</code>,{" "}
              <code className="text-xs">braces</code>) — fixable via <code className="text-xs">npm overrides</code>{" "}
              without touching direct deps.
            </li>
            <li>
              <b>axios 0.21.1</b> is a direct dep with a known SSRF CVE; it's also 2 major versions behind. Highest
              priority direct-dep fix.
            </li>
            <li>
              <b>2 GPL-3.0 packages</b> in a proprietary codebase need legal review before the next release.
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vulnerabilities by severity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={severity} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
                  {severity.map((_, i) => (
                    <Cell key={i} fill={severityColors[i % severityColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Package age distribution</CardTitle>
            <CardDescription>Time since last version bump</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ageBuckets} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid {...grid} />
                <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vulns">
        <TabsList>
          <TabsTrigger value="vulns">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="outdated">Outdated</TabsTrigger>
          <TabsTrigger value="licenses">Licenses</TabsTrigger>
        </TabsList>

        <TabsContent value="vulns">
          <Card>
            <CardHeader>
              <CardTitle>Known vulnerabilities</CardTitle>
              <CardDescription>Click a column header to sort</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => toggle("pkg")} className="cursor-pointer">Package{sortIcon("pkg")}</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Latest</TableHead>
                    <TableHead onClick={() => toggle("sev")} className="cursor-pointer">Severity{sortIcon("sev")}</TableHead>
                    <TableHead>CVE</TableHead>
                    <TableHead>Fix</TableHead>
                    <TableHead>Direct</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs font-medium">{r.pkg}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{r.current}</TableCell>
                      <TableCell className="font-mono text-xs">{r.latest}</TableCell>
                      <TableCell>
                        <Badge variant={sevVariant[r.sev]}>{r.sev}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{r.cve}</TableCell>
                      <TableCell className="text-xs">{r.fix}</TableCell>
                      <TableCell>{r.direct ? <Badge variant="default">yes</Badge> : <span className="text-xs text-muted-foreground">transitive</span>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outdated">
          <Card>
            <CardHeader>
              <CardTitle>Outdated direct dependencies</CardTitle>
              <CardDescription>Top by age</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Latest</TableHead>
                    <TableHead>Behind by</TableHead>
                    <TableHead>Upgrade risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outdated.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs font-medium">{r.pkg}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{r.current}</TableCell>
                      <TableCell className="font-mono text-xs">{r.latest}</TableCell>
                      <TableCell className="tabular-nums">{r.age}</TableCell>
                      <TableCell>
                        <Badge variant={riskVariant[r.risk]}>{r.risk}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licenses">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>License distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={licenses} dataKey="count" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
                      {licenses.map((_, i) => (
                        <Cell key={i} fill={licenseColors[i % licenseColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Remediation progress</CardTitle>
                <CardDescription>{fixed}/{total} vulnerabilities fixed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={(fixed / total) * 100} />
                <p className="text-sm leading-relaxed">
                  <b className="text-destructive">2 GPL-3.0</b> packages flagged for legal review. 1 unknown-license
                  package (<code className="text-xs">legacy-utils</code>) needs a source check.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground">
        Source: <code>npm audit</code> + license scan, 2026-10-14. 142 direct, 1,204 transitive dependencies.
        Figures are demo data.
      </p>
    </div>
  );
}
