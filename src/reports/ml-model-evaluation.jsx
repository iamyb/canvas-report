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
  title: "LLM Benchmark Evaluation — October 2026",
  description: "Cross-benchmark comparison of frontier and open-weight models on MMLU, GPQA, and HumanEval, with cost analysis",
  badges: [{ label: "Public benchmark data", variant: "success" }],
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
const pct = (v) => `${(v * 100).toFixed(1)}%`;

// MMLU — knowledge across 57 subjects (0–1 scale). Top 12.
const mmlu = [
  { model: "GPT-5", org: "OpenAI", score: 0.925, open: false },
  { model: "Seed 1.8", org: "ByteDance", score: 0.923, open: false },
  { model: "o1", org: "OpenAI", score: 0.918, open: false },
  { model: "GPT-4.5", org: "OpenAI", score: 0.908, open: false },
  { model: "Sarvam-105B", org: "Sarvam", score: 0.906, open: true },
  { model: "Qwen3-VL 235B", org: "Alibaba", score: 0.906, open: true },
  { model: "Claude 3.5 Sonnet", org: "Anthropic", score: 0.904, open: false },
  { model: "Kimi K2 0905", org: "Moonshot", score: 0.902, open: true },
  { model: "GPT-4.1", org: "OpenAI", score: 0.902, open: false },
  { model: "GPT-OSS 120B", org: "OpenAI", score: 0.900, open: true },
  { model: "LongCat-Flash", org: "Meituan", score: 0.897, open: true },
  { model: "Kimi K2 Instruct", org: "Moonshot", score: 0.895, open: true },
];

// GPQA — graduate-level reasoning, 448 Qs (PhD experts ≈ 65%). Top 12.
const gpqa = [
  { model: "GPT-6 Astra", org: "OpenAI", score: 0.960, open: false },
  { model: "Claude Mythos", org: "Anthropic", score: 0.946, open: false },
  { model: "GPT-5.6 Sol", org: "OpenAI", score: 0.946, open: false },
  { model: "Gemini 3.1 Pro", org: "Google", score: 0.943, open: false },
  { model: "Claude Opus 4.7", org: "Anthropic", score: 0.942, open: false },
  { model: "GPT-5.5", org: "OpenAI", score: 0.936, open: false },
  { model: "Claude Opus 4.8", org: "Anthropic", score: 0.936, open: false },
  { model: "Kimi K3", org: "Moonshot", score: 0.935, open: true },
  { model: "GPT-5.2 Pro", org: "OpenAI", score: 0.932, open: false },
  { model: "Grok 4.5", org: "xAI", score: 0.930, open: false },
  { model: "GPT-5.6 Terra", org: "OpenAI", score: 0.929, open: false },
  { model: "GPT-5.4", org: "OpenAI", score: 0.928, open: false },
];

// HumanEval — functional correctness on 164 code problems. Top 12.
const humaneval = [
  { model: "MiniCPM-SALA", org: "OpenBMB", score: 0.951, open: true },
  { model: "Kimi K2 0905", org: "Moonshot", score: 0.945, open: true },
  { model: "Claude 3.5 Sonnet", org: "Anthropic", score: 0.937, open: false },
  { model: "GPT-5", org: "OpenAI", score: 0.934, open: false },
  { model: "Kimi K2 Instruct", org: "Moonshot", score: 0.933, open: true },
  { model: "Qwen2.5-Coder 32B", org: "Alibaba", score: 0.927, open: true },
  { model: "o1-mini", org: "OpenAI", score: 0.924, open: false },
  { model: "Sarvam-30B", org: "Sarvam", score: 0.921, open: true },
  { model: "Mistral Large 2", org: "Mistral", score: 0.920, open: true },
  { model: "Qwen2.5-VL 32B", org: "Alibaba", score: 0.915, open: true },
  { model: "GPT-4o", org: "OpenAI", score: 0.902, open: false },
  { model: "Llama 3.1 405B", org: "Meta", score: 0.890, open: true },
];

// Models with both MMLU and HumanEval reported — for the grouped comparison.
const multi = [
  { model: "GPT-5", mmlu: 0.925, he: 0.934 },
  { model: "o1", mmlu: 0.918, he: 0.881 },
  { model: "GPT-4.5", mmlu: 0.908, he: 0.880 },
  { model: "Claude 3.5 Sonnet", mmlu: 0.904, he: 0.937 },
  { model: "Kimi K2 0905", mmlu: 0.902, he: 0.945 },
  { model: "GPT-4o", mmlu: 0.887, he: 0.902 },
  { model: "Grok-2", mmlu: 0.875, he: 0.884 },
  { model: "Llama 3.1 405B", mmlu: 0.873, he: 0.890 },
  { model: "GPT-4 Turbo", mmlu: 0.865, he: 0.871 },
  { model: "Llama 3.3 70B", mmlu: 0.860, he: 0.884 },
  { model: "Phi-4", mmlu: 0.848, he: 0.826 },
  { model: "Qwen2.5 32B", mmlu: 0.833, he: 0.884 },
];

// Cost vs capability: MMLU score vs blended price (8:1 input:output, $/1M tokens).
const costData = [
  { model: "GPT-4.1", mmlu: 0.902, price: 2.667 },
  { model: "GPT-OSS 120B", mmlu: 0.900, price: 0.054 },
  { model: "GPT-4o", mmlu: 0.887, price: 3.333 },
  { model: "DeepSeek-V3", mmlu: 0.885, price: 0.383 },
  { model: "GPT-4 Turbo", mmlu: 0.865, price: 12.222 },
  { model: "Llama 3.3 70B", mmlu: 0.860, price: 0.124 },
  { model: "Llama 4 Maverick", mmlu: 0.855, price: 0.267 },
  { model: "GPT-OSS 20B", mmlu: 0.853, price: 0.042 },
  { model: "Phi-4", mmlu: 0.848, price: 0.078 },
  { model: "Llama 3.1 70B", mmlu: 0.836, price: 0.40 },
  { model: "Qwen2.5 32B", mmlu: 0.833, price: 0.364 },
];

export default function Report() {
  const { sorted, sort, toggle } = useSort(multi, { key: "mmlu", dir: "desc" });
  const sortIcon = (key) => (sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Top MMLU" value="92.5%" hint="GPT-5 (OpenAI)" tone="success" />
        <Stat label="Top GPQA" value="96.0%" hint="GPT-6 Astra (OpenAI)" tone="success" />
        <Stat label="Top HumanEval" value="95.1%" hint="MiniCPM-SALA (OpenBMB)" tone="success" />
        <Stat label="Best value" value="90.0%" hint="GPT-OSS 120B @ $0.05/M" tone="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key findings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
            <li>
              <b>Open-weight models are within ~2.5 pts of the frontier</b> on MMLU: GPT-OSS 120B (90.0%) and
              Kimi K2 (90.2%) trail GPT-5 (92.5%) by only 2–2.5 pts, at a fraction of the cost.
            </li>
            <li>
              <b>Reasoning is the most crowded frontier.</b> GPQA's top 12 are all within 3.2 pts (96.0% → 92.8%),
              and the benchmark is near saturation — PhD experts score ~65%, so the top models are ~31 pts above
              expert baseline.
            </li>
            <li>
              <b>Coding and knowledge don't rank the same models.</b> Claude 3.5 Sonnet leads HumanEval among
              proprietary models (93.7%) but is mid-pack on MMLU (90.4%); Kimi K2 0905 is #2 on HumanEval (94.5%)
              and #8 on MMLU. No single model wins all three.
            </li>
            <li>
              <b>Cost is the differentiator.</b> GPT-OSS 120B delivers 90.0% MMLU at ~$0.05/M tokens — roughly
              <b> 60× cheaper</b> than GPT-4 Turbo (12.2¢/M) for a comparable knowledge score.
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>MMLU — knowledge across 57 subjects</CardTitle>
            <CardDescription>Top 12 of 103 models. Green = open-weight.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={mmlu} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0.8, 0.95]} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => pct(v)} />
                <YAxis type="category" dataKey="model" tick={{ fill: "var(--color-chart-tick)", fontSize: 11 }} axisLine={false} tickLine={false} width={130} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => pct(v)} labelFormatter={(l, p) => `${l} (${p[0]?.payload.org})`} />
                <Bar dataKey="score" name="MMLU" radius={[0, 4, 4, 0]} barSize={16}>
                  {mmlu.map((d, i) => (
                    <Cell key={i} fill={d.open ? "var(--color-chart-2)" : "var(--color-chart-1)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GPQA — graduate-level reasoning</CardTitle>
            <CardDescription>Top 12 of 250 models. 448 expert-written Qs; PhD experts ≈ 65%.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={gpqa} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0.9, 1.0]} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => pct(v)} />
                <YAxis type="category" dataKey="model" tick={{ fill: "var(--color-chart-tick)", fontSize: 11 }} axisLine={false} tickLine={false} width={130} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => pct(v)} labelFormatter={(l, p) => `${l} (${p[0]?.payload.org})`} />
                <ReferenceLine x={0.65} stroke="var(--color-chart-4)" strokeDasharray="4 4" label={{ value: "PhD expert ≈ 65%", fill: "var(--color-chart-4)", fontSize: 11, position: "insideTopRight" }} />
                <Bar dataKey="score" name="GPQA" radius={[0, 4, 4, 0]} barSize={16}>
                  {gpqa.map((d, i) => (
                    <Cell key={i} fill={d.open ? "var(--color-chart-2)" : "var(--color-chart-1)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>HumanEval — code generation</CardTitle>
            <CardDescription>Top 12 of 66 models. Functional correctness on 164 problems.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={humaneval} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0.85, 1.0]} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => pct(v)} />
                <YAxis type="category" dataKey="model" tick={{ fill: "var(--color-chart-tick)", fontSize: 11 }} axisLine={false} tickLine={false} width={130} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => pct(v)} labelFormatter={(l, p) => `${l} (${p[0]?.payload.org})`} />
                <Bar dataKey="score" name="HumanEval" radius={[0, 4, 4, 0]} barSize={16}>
                  {humaneval.map((d, i) => (
                    <Cell key={i} fill={d.open ? "var(--color-chart-2)" : "var(--color-chart-1)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost vs capability</CardTitle>
            <CardDescription>
              MMLU score vs blended API price (8:1 input:output, $/1M tokens, log scale). Bottom-right = cheap and
              capable = best value.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={360}>
              <ScatterChart margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" />
                <XAxis type="number" dataKey="price" name="Price" scale="log" domain={[0.03, 15]} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v < 1 ? v.toFixed(2) : v.toFixed(0)}`} label={{ value: "Blended price ($/1M tokens, log)", position: "insideBottom", offset: -4, fill: "var(--color-chart-tick)", fontSize: 12 }} />
                <YAxis type="number" dataKey="mmlu" name="MMLU" domain={[0.82, 0.92]} tick={axisTick} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => pct(v)} label={{ value: "MMLU", angle: -90, position: "insideLeft", fill: "var(--color-chart-tick)", fontSize: 12 }} />
                <ZAxis range={[120, 120]} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => (n === "Price" ? `$${v < 1 ? v.toFixed(3) : v.toFixed(2)}/M` : pct(v))} labelFormatter={() => ""} />
                <Scatter data={costData} fill="var(--color-chart-1)">
                  {costData.map((d, i) => (
                    <Cell key={i} fill={d.price < 0.5 ? "var(--color-chart-2)" : "var(--color-chart-1)"} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <p className="mt-3 text-xs text-muted-foreground">
              <span className="text-success">■</span> Green = under $0.50/M (open-weight / low-cost).{" "}
              <span className="text-primary">■</span> Blue = frontier pricing. GPT-OSS 120B and DeepSeek-V3 sit in
              the high-score / low-cost quadrant.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>MMLU vs HumanEval</CardTitle>
          <CardDescription>
            {multi.length} models with both scores reported. Click a header to sort. Knowledge and coding
            capability are only weakly correlated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={multi} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
              <CartesianGrid {...grid} />
              <XAxis dataKey="model" tick={{ fill: "var(--color-chart-tick)", fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-28} textAnchor="end" height={60} />
              <YAxis domain={[0.8, 1.0]} tick={axisTick} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => pct(v)} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => pct(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="mmlu" name="MMLU" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} barSize={14} />
              <Bar dataKey="he" name="HumanEval" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => toggle("model")} className="cursor-pointer">Model{sortIcon("model")}</TableHead>
                  <TableHead onClick={() => toggle("mmlu")} className="cursor-pointer text-right">MMLU{sortIcon("mmlu")}</TableHead>
                  <TableHead onClick={() => toggle("he")} className="cursor-pointer text-right">HumanEval{sortIcon("he")}</TableHead>
                  <TableHead className="text-right">Δ (HE − MMLU)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((r, i) => {
                  const d = (r.he - r.mmlu) * 100;
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.model}</TableCell>
                      <TableCell className="text-right tabular-nums">{pct(r.mmlu)}</TableCell>
                      <TableCell className="text-right tabular-nums">{pct(r.he)}</TableCell>
                      <TableCell className={`text-right tabular-nums ${d > 0 ? "text-success" : d < 0 ? "text-destructive" : ""}`}>
                        {d > 0 ? "+" : ""}{d.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Source: llm-stats.com public leaderboards, last updated 2026-10-14. MMLU (103 models), GPQA (250 models),
        HumanEval (66 models). Scores are self-reported by vendors unless marked verified. Prices are list API prices
        (input/output per 1M tokens); blended = 8:1 input:output.
      </p>
    </div>
  );
}
