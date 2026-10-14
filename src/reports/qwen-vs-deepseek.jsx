import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Stat } from "../components/ui/stat.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table.jsx";
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
  title: "Qwen3.8-27B Local vs DeepSeek API: Cost & Time Comparison",
  description:
    "Based on your token usage data, combined with local inference speed and electricity cost estimates; local model Qwen3.8-27B (Prefill 1352.45 t/s / Decode 96.50 t/s); DeepSeek API pricing as of 2026-10-12",
  badges: [{ label: "Data from usage stats screenshot", variant: "secondary" }],
  updatedAt: "2026-10-14",
};

const tooltipStyle = {
  backgroundColor: "var(--color-chart-tooltip-bg)",
  border: "1px solid var(--color-chart-tooltip-border)",
  borderRadius: 8,
  color: "var(--color-chart-tooltip-fg)",
};
const axisTick = { fill: "var(--color-chart-tick)", fontSize: 12 };
const fmt = (n) => n.toLocaleString("en-US");

const tokenRows = [
  { type: "Cached (cache hit)", tokens: 909347216, pct: 91.2, total: false },
  { type: "Processed (non-cached input)", tokens: 68882482, pct: 6.9, total: false },
  { type: "Generated (output)", tokens: 18681264, pct: 1.9, total: false },
  { type: "Input tokens total", tokens: 978229698, pct: 98.0, total: true },
  { type: "Input + output tokens total", tokens: 996910962, pct: 100.0, total: true },
];
const requests = 20136;
const avgPerRequest = 49500;

const tokenShare = [
  { name: "Cached (cache hit)", value: 91.2 },
  { name: "Processed (non-cached input)", value: 6.9 },
  { name: "Generated (output)", value: 1.9 },
];
const shareColors = ["var(--color-chart-1)", "var(--color-chart-3)", "var(--color-chart-2)"];

const localPhases = [
  { phase: "Prefill (cache hit)", tokens: 909347216, speed: 1352.45, time: "7.82 days", hours: 187.7 },
  { phase: "Prefill (non-cached input)", tokens: 68882482, speed: 1352.45, time: "14.15 hours", hours: 14.2 },
  { phase: "Decode (output)", tokens: 18681264, speed: 96.5, time: "2.24 days", hours: 53.8 },
];
const localTotalTime = "10d 15h 32m (~254.9 hours)";
const power = { watts: 600, hours: 254.9, kwh: 152.94, pricePerKwh: 0.6, costCny: 91.76 };

const deepseek = [
  { model: "V4.1-Flash", cacheIn: 0.003, input: 0.15, output: 0.6, offPeak: 24.27, peak: 48.54, cnyOffPeak: 176 },
  { model: "V4.1-Pro", cacheIn: 0.022, input: 0.66, output: 1.98, offPeak: 102.46, peak: 204.91, cnyOffPeak: 735 },
];

const costCompare = [
  { name: "Local inference\n(Qwen3.8-27B)", cost: 91.76 },
  { name: "DeepSeek-V4.1-Flash", cost: 176 },
  { name: "DeepSeek-V4.1-Pro", cost: 735 },
];
const costColors = ["var(--color-chart-2)", "var(--color-chart-1)", "#ef4444"];

const compareRows = [
  { item: "Total tokens", local: fmt(996910962), flash: fmt(996910962), pro: fmt(996910962) },
  { item: "Estimated cost", local: "~¥91.76 electricity", flash: "$24.27 (~¥176)", pro: "$102.46 (~¥735)" },
  { item: "Estimated time", local: localTotalTime, flash: "—", pro: "—" },
];

const notes = [
  "DeepSeek costs are based on official API pricing; actual costs may vary depending on cache hit ratio, request time windows, and other factors.",
  "Local inference time is calculated for single-stream sequential processing; wall-clock time will differ with parallel requests or batch processing.",
  "Electricity cost is estimated at 600W power draw and ¥0.6/kWh; actual power consumption varies with load, GPU utilization, etc.",
  "Qwen3.8-27B is an open-source model; local deployment may differ from cloud services in performance, features, and output quality.",
];

function MiniStat({ label, value, hint }) {
  return (
    <div className="rounded-lg border border-border bg-card/50 px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export default function Report() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total tokens" value="996.9M" hint="978.2M input + 18.7M output" />
        <Stat label="Local electricity cost" value="~¥91.76" hint="600W × 254.9h × ¥0.6/kWh" tone="success" />
        <Stat label="DeepSeek-V4.1-Flash" value="$24.27" hint="off-peak (~¥176)" />
        <Stat label="Total local inference time" value="~254.9 hours" hint="≈ 10.6 days single-stream" tone="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key findings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-4 text-sm text-foreground/90">
            <li>
              At this usage (~997M tokens), local electricity costs ~<b>¥91.76</b> — about 52% of
              DeepSeek-V4.1-Flash off-peak (~¥176) and 12% of V4.1-Pro (~¥735). Purely on money, local is cheapest.
            </li>
            <li>
              The trade-off is time: local needs ~<b>10.6 days</b> of single-stream inference (254.9 hours),
              infeasible for interactive use; the API costs 1.9–8× more but returns instantly.
            </li>
            <li>
              Cache hits account for <b>91.2%</b> of tokens and dominate the cost structure: on the API side,
              cached input is billed at 1/50 (Flash) / 1/30 (Pro) of non-cached rates; locally, cached prefill is fast,
              but the 909M tokens still contribute ~7.8 days of inference time.
            </li>
            <li>
              Conclusion: if waiting is acceptable (offline batch), local is cheaper; if instant response matters,
              Flash off-peak is the best value among API options.
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your local token usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Share (approx.)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokenRows.map((r) => (
                  <TableRow key={r.type} className={r.total ? "border-t border-border" : ""}>
                    <TableCell className={r.total ? "font-medium" : ""}>{r.type}</TableCell>
                    <TableCell className="tabular-nums">{fmt(r.tokens)}</TableCell>
                    <TableCell className="tabular-nums">{r.pct.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Completed requests" value={`${fmt(requests)}`} />
              <MiniStat label="Avg tokens per request" value={`~${fmt(avgPerRequest)}`} hint="input + output" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token composition</CardTitle>
            <CardDescription>Cache hits dominate overwhelmingly</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={tokenShare} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {tokenShare.map((_, i) => (
                    <Cell key={i} fill={shareColors[i % shareColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v.toFixed(1)}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Local inference time estimate</CardTitle>
            <CardDescription>Prefill 1352.45 t/s, Decode 96.50 t/s</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phase</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Speed (t/s)</TableHead>
                  <TableHead>Time required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localPhases.map((p) => (
                  <TableRow key={p.phase}>
                    <TableCell>{p.phase}</TableCell>
                    <TableCell className="tabular-nums">{fmt(p.tokens)}</TableCell>
                    <TableCell className="tabular-nums">{p.speed}</TableCell>
                    <TableCell className="tabular-nums">{p.time}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t border-border">
                  <TableCell className="font-medium">Total</TableCell>
                  <TableCell className="tabular-nums">{fmt(996910962)}</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell className="tabular-nums">{localTotalTime}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="mb-3 text-sm font-medium">⚡ Electricity estimate (at ¥{power.pricePerKwh}/kWh)</div>
              <div className="grid grid-cols-3 gap-3">
                <MiniStat label="Machine power draw" value="600 W" hint="0.6 kW" />
                <MiniStat label="Total energy" value={`${power.kwh} kWh`} hint={`0.6 × ${power.hours}h`} />
                <MiniStat label="Electricity cost" value={`~¥${power.costCny}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time breakdown by phase</CardTitle>
            <CardDescription>Unit: hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={localPhases.map((p) => ({ name: p.phase.split("(")[0], hours: p.hours }))}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  unit=" h"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  width={72}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v} h`} labelStyle={{ color: "var(--color-chart-tick)" }} />
                <Bar dataKey="hours" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-3 text-xs text-muted-foreground">
              Cached prefill (187.7h) accounts for ~73% of total time — the main source of local inference duration.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>DeepSeek API cost estimate</CardTitle>
          <CardDescription>Based on official DeepSeek API pricing (2026-10-12), unit: USD per 1M tokens</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Billing item</TableHead>
                <TableHead>V4.1-Flash (off-peak)</TableHead>
                <TableHead>V4.1-Pro (off-peak)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Cached input</TableCell>
                <TableCell className="tabular-nums">$0.003 / 1M</TableCell>
                <TableCell className="tabular-nums">$0.022 / 1M</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Non-cached input</TableCell>
                <TableCell className="tabular-nums">$0.15 / 1M</TableCell>
                <TableCell className="tabular-nums">$0.66 / 1M</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Output tokens</TableCell>
                <TableCell className="tabular-nums">$0.60 / 1M</TableCell>
                <TableCell className="tabular-nums">$1.98 / 1M</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="grid gap-3 md:grid-cols-2">
            {deepseek.map((d) => (
              <div key={d.model} className="rounded-lg border border-border bg-card/50 p-4">
                <div className="text-sm text-muted-foreground">DeepSeek-{d.model}</div>
                <div className="mt-1 text-3xl font-semibold tabular-nums">${d.offPeak.toFixed(2)}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  (peak hours: ${d.peak.toFixed(2)})
                </div>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={deepseek.map((d) => ({ name: d.model, offPeak: d.offPeak, peak: d.peak }))}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={48} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `$${v}`} labelStyle={{ color: "var(--color-chart-tick)" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="offPeak" name="Off-peak" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="peak" name="Peak" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Local vs DeepSeek cost comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Local inference (Qwen3.8-27B)</TableHead>
                  <TableHead>DeepSeek-V4.1-Flash</TableHead>
                  <TableHead>DeepSeek-V4.1-Pro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compareRows.map((r) => (
                  <TableRow key={r.item}>
                    <TableCell className="font-medium">{r.item}</TableCell>
                    <TableCell className="tabular-nums">{r.local}</TableCell>
                    <TableCell className="tabular-nums">{r.flash}</TableCell>
                    <TableCell className="tabular-nums">{r.pro}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost comparison (in CNY)</CardTitle>
            <CardDescription>DeepSeek at off-peak prices</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={costCompare} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--color-chart-tick)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} width={48} unit="¥" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `~¥${v}`} labelStyle={{ color: "var(--color-chart-tick)" }} />
                <Bar dataKey="cost" radius={[4, 4, 0, 0]} barSize={48}>
                  {costCompare.map((_, i) => (
                    <Cell key={i} fill={costColors[i % costColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            {notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
