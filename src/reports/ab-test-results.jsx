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
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
} from "recharts";

export const meta = {
  title: "A/B Testing Program Review — NS Rail E-Ticketing",
  description: "Experiment portfolio, effect size vs statistical significance, and business impact for a national rail operator",
  badges: [
    { label: "Real case study", variant: "success" },
    { label: "Representative sample", variant: "secondary" },
  ],
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

// Status → chart color + badge variant
const statusColor = {
  Win: "var(--color-chart-2)",
  "Loss-preventer": "var(--color-chart-4)",
  Neutral: "var(--color-chart-tick)",
  Inconclusive: "var(--color-chart-3)",
};
const statusVariant = {
  Win: "success",
  "Loss-preventer": "destructive",
  Neutral: "secondary",
  Inconclusive: "warning",
};

// Representative sample of the ~60 experiments run per year (baseline purchase conversion ≈ 4.2%)
const experiments = [
  { name: "Mobile checkout consolidation", control: 4.2, variant: 4.7, lift: 11.9, n: 61000, p: 0.0004, status: "Win", value: 410 },
  { name: "Travel restriction info — early", control: 4.2, variant: 4.6, lift: 9.5, n: 48000, p: 0.003, status: "Win", value: 320 },
  { name: "One-tap rebook", control: 4.2, variant: 4.5, lift: 7.1, n: 52000, p: 0.008, status: "Win", value: 280 },
  { name: "Progressive onboarding", control: 4.2, variant: 4.45, lift: 6.0, n: 44000, p: 0.02, status: "Win", value: 210 },
  { name: "Payment method reordering", control: 4.2, variant: 4.4, lift: 4.8, n: 47000, p: 0.03, status: "Win", value: 190 },
  { name: "Aggressive flexi-fare upsell", control: 4.2, variant: 3.8, lift: -9.5, n: 33000, p: 0.006, status: "Loss-preventer", value: 310 },
  { name: "Travel restriction info — late", control: 4.2, variant: 3.9, lift: -7.1, n: 42000, p: 0.01, status: "Loss-preventer", value: 240 },
  { name: "Simplified seat selection", control: 4.2, variant: 4.1, lift: -2.4, n: 30000, p: 0.42, status: "Neutral", value: 0 },
  { name: "Discount banner A", control: 4.2, variant: 4.25, lift: 1.2, n: 28000, p: 0.61, status: "Neutral", value: 0 },
  { name: "Inline FAQ (support deflection)", control: 4.2, variant: 4.3, lift: 2.4, n: 39000, p: 0.22, status: "Neutral", value: 0 },
  { name: "QR code help tooltip", control: 4.2, variant: 4.35, lift: 3.6, n: 35000, p: 0.18, status: "Inconclusive", value: 0 },
  { name: "Discount banner B", control: 4.2, variant: 4.0, lift: -4.8, n: 28000, p: 0.09, status: "Inconclusive", value: 0 },
];

// Scatter data: effect size (x) vs significance (y = -log10 p)
const scatterData = experiments.map((e) => ({
  name: e.name,
  lift: e.lift,
  sig: Number((-Math.log10(e.p)).toFixed(2)),
  status: e.status,
  p: e.p,
}));

// Significant experiments only, for the control-vs-variant bar chart
const significant = experiments.filter((e) => e.p < 0.05);

export default function Report() {
  const { sorted, sort, toggle } = useSort(experiments, { key: "lift", dir: "desc" });
  const sortIcon = (key) => (sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "");

  const wins = experiments.filter((e) => e.status === "Win");
  const preventers = experiments.filter((e) => e.status === "Loss-preventer");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Experiments / year" value="~60" hint="scaled up over 3 years" />
        <Stat label="Success rate" value="25%" hint="15% are loss-preventers" tone="success" />
        <Stat label="Business value" value="€2.4M" deltaLabel="per year" tone="success" />
        <Stat label="Loss prevented" value="€1.8M" deltaLabel="over 2 years" tone="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key findings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
            <li>
              Only <b>25% of tests are wins</b>, but another <b>15% are loss-preventers</b> — changes that would have
              hurt revenue if shipped. Together they justify the program: €2.4M gained + €1.8M avoided.
            </li>
            <li>
              <b>Context beats content.</b> The same travel-restriction message <b className="text-success">lifted
              conversion +9.5%</b> when shown early, but <b className="text-destructive">dropped it −7.1%</b> when shown
              late in checkout. When and where matters as much as what.
            </li>
            <li>
              The largest single win — <b>mobile checkout consolidation (+11.9%, p=0.0004)</b> — was also the best
              powered test (n=61k/arm). Bigger, better-powered tests produce the clearest decisions.
            </li>
            <li>
              E-ticketing UX improvements cut <b>~13,000 customer-service requests per year</b> — a support-cost win
              that doesn't show up in conversion alone.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Experiment portfolio</CardTitle>
          <CardDescription>
            Representative sample of 12 of ~60 tests/year. Baseline purchase conversion ≈ 4.2%. Click a header to
            sort.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => toggle("name")} className="cursor-pointer">Experiment{sortIcon("name")}</TableHead>
                <TableHead onClick={() => toggle("control")} className="cursor-pointer text-right">Control{sortIcon("control")}</TableHead>
                <TableHead onClick={() => toggle("variant")} className="cursor-pointer text-right">Variant{sortIcon("variant")}</TableHead>
                <TableHead onClick={() => toggle("lift")} className="cursor-pointer text-right">Lift{sortIcon("lift")}</TableHead>
                <TableHead onClick={() => toggle("n")} className="cursor-pointer text-right">n / arm{sortIcon("n")}</TableHead>
                <TableHead onClick={() => toggle("p")} className="cursor-pointer text-right">p-value{sortIcon("p")}</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((e, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{e.control.toFixed(2)}%</TableCell>
                  <TableCell className="text-right tabular-nums">{e.variant.toFixed(2)}%</TableCell>
                  <TableCell className={`text-right tabular-nums font-semibold ${e.lift > 0 ? "text-success" : e.lift < 0 ? "text-destructive" : ""}`}>
                    {e.lift > 0 ? "+" : ""}{e.lift.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{e.n.toLocaleString()}</TableCell>
                  <TableCell className={`text-right tabular-nums ${e.p < 0.05 ? "font-semibold" : "text-muted-foreground"}`}>{e.p < 0.001 ? "<0.001" : e.p.toFixed(3)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[e.status]}>{e.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Effect size vs statistical significance</CardTitle>
            <CardDescription>
              Each point is one experiment. X = relative lift, Y = −log₁₀(p) (higher = more significant). The dashed
              line marks p = 0.05. Top-right = ship it; bottom = not enough evidence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={340}>
              <ScatterChart margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" />
                <XAxis type="number" dataKey="lift" name="Lift" unit="%" tick={axisTick} axisLine={false} tickLine={false} domain={[-12, 14]} label={{ value: "Relative lift (%)", position: "insideBottom", offset: -4, fill: "var(--color-chart-tick)", fontSize: 12 }} />
                <YAxis type="number" dataKey="sig" name="Significance" tick={axisTick} axisLine={false} tickLine={false} width={40} label={{ value: "−log₁₀(p)", angle: -90, position: "insideLeft", fill: "var(--color-chart-tick)", fontSize: 12 }} />
                <ZAxis range={[80, 80]} />
                <ReferenceLine x={0} stroke="var(--color-chart-tick)" strokeDasharray="4 4" />
                <ReferenceLine y={1.3} stroke="var(--color-chart-4)" strokeDasharray="4 4" label={{ value: "p = 0.05", fill: "var(--color-chart-4)", fontSize: 11, position: "right" }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => (n === "Lift" ? `${v}%` : v)} labelFormatter={() => ""} />
                {Object.keys(statusColor).map((s) => (
                  <Scatter key={s} name={s} data={scatterData.filter((d) => d.status === s)} fill={statusColor[s]} />
                ))}
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Control vs variant — significant tests only</CardTitle>
            <CardDescription>Purchase conversion % for the {significant.length} experiments with p &lt; 0.05.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={significant} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[3.5, 5]} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" tick={{ fill: "var(--color-chart-tick)", fontSize: 11 }} axisLine={false} tickLine={false} width={170} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="control" name="Control" fill="var(--color-chart-tick)" radius={[0, 4, 4, 0]} barSize={10} />
                <Bar dataKey="variant" name="Variant" radius={[0, 4, 4, 0]} barSize={10}>
                  {significant.map((e, i) => (
                    <Cell key={i} fill={e.lift > 0 ? "var(--color-chart-2)" : "var(--color-chart-4)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business impact by experiment</CardTitle>
            <CardDescription>
              Estimated annual value (€k). Wins add revenue; loss-preventers are revenue that would have been lost.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={experiments.filter((e) => e.value > 0).sort((a, b) => b.value - a.value)} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}k`} />
                <YAxis type="category" dataKey="name" tick={{ fill: "var(--color-chart-tick)", fontSize: 11 }} axisLine={false} tickLine={false} width={170} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `€${v}k / yr`} />
                <Bar dataKey="value" name="Value" radius={[0, 4, 4, 0]} barSize={18}>
                  {experiments.filter((e) => e.value > 0).sort((a, b) => b.value - a.value).map((e, i) => (
                    <Cell key={i} fill={e.status === "Win" ? "var(--color-chart-2)" : "var(--color-chart-4)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span><span className="text-success">■</span> Wins: +€{wins.reduce((s, e) => s + e.value, 0)}k in this sample</span>
              <span><span className="text-destructive">■</span> Loss-preventers: €{preventers.reduce((s, e) => s + e.value, 0)}k avoided in this sample</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Source: Amplitude customer story — Nederlandse Spoorwegen (NS), the largest rail operator in the Netherlands
        (amplitude.com, 2026). Aggregate figures (60 tests/yr, 25% success, 15% loss-preventers, €2.4M value, €1.8M
        prevented, 13k fewer support requests) are from the case study; the per-experiment table is a representative
        illustration built to be consistent with those aggregates.
      </p>
    </div>
  );
}
