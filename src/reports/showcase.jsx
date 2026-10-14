import { useState } from "react";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Separator } from "../components/ui/separator.jsx";

import ExampleReport, { meta as exampleMeta } from "./example-report.jsx";
import QwenVsDeepSeek, { meta as qwenMeta } from "./qwen-vs-deepseek.jsx";
import CloudCostAudit, { meta as cloudMeta } from "./cloud-cost-audit.jsx";
import ApiPerfReview, { meta as apiMeta } from "./api-perf-review.jsx";
import IncidentPostmortem, { meta as incidentMeta } from "./incident-postmortem.jsx";
import DependencyAudit, { meta as depMeta } from "./dependency-audit.jsx";
import SaaSGrowth, { meta as saasMeta } from "./saas-growth.jsx";
import DevOpsMaturity, { meta as devopsMeta } from "./devops-maturity.jsx";
import ABTestResults, { meta as abMeta } from "./ab-test-results.jsx";
import MLModelEvaluation, { meta as mlMeta } from "./ml-model-evaluation.jsx";

export const meta = {
  title: "canvas-report Showcase",
  description:
    "All sample reports rendered live in this page — click a card to open the full report inline. Works offline in the exported single-file HTML.",
  updatedAt: "2026-10-14",
};

const REPORTS = [
  { id: "example-report", Comp: ExampleReport, meta: exampleMeta, tag: "Getting started" },
  { id: "saas-growth", Comp: SaaSGrowth, meta: saasMeta, tag: "Business" },
  { id: "cloud-cost-audit", Comp: CloudCostAudit, meta: cloudMeta, tag: "FinOps" },
  { id: "api-perf-review", Comp: ApiPerfReview, meta: apiMeta, tag: "Performance" },
  { id: "incident-postmortem", Comp: IncidentPostmortem, meta: incidentMeta, tag: "Reliability" },
  { id: "dependency-audit", Comp: DependencyAudit, meta: depMeta, tag: "Security" },
  { id: "devops-maturity", Comp: DevOpsMaturity, meta: devopsMeta, tag: "Engineering" },
  { id: "ab-test-results", Comp: ABTestResults, meta: abMeta, tag: "Data science" },
  { id: "ml-model-evaluation", Comp: MLModelEvaluation, meta: mlMeta, tag: "AI / ML" },
  { id: "qwen-vs-deepseek", Comp: QwenVsDeepSeek, meta: qwenMeta, tag: "Cost analysis" },
];

export default function Showcase() {
  const [openId, setOpenId] = useState(null);
  const open = REPORTS.find((r) => r.id === openId);

  if (open) {
    const OpenComp = open.Comp;
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setOpenId(null)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted print:hidden"
          >
            ← Back to gallery
          </button>
          <span className="text-xs text-muted-foreground">{open.id}</span>
        </div>
        <Separator />
        <OpenComp />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        {REPORTS.length} sample reports, each rendered live below at reduced scale. Click a card to
        open the full interactive report (sorting, tooltips, tabs all work).
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        {REPORTS.map(({ id, Comp, meta, tag }) => (
          <Card key={id} className="overflow-hidden">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setOpenId(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenId(id);
                }
              }}
              className="group block w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Open ${meta.title}`}
            >
              <div className="relative h-85 overflow-hidden border-b border-border bg-background">
                <div className="pointer-events-none absolute left-0 top-0 w-[312.5%] origin-top-left scale-[0.32] select-none px-5 py-4">
                  <Comp />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-background via-background/90 to-transparent px-4 pb-2 pt-8 text-xs font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  <span>Open full report</span>
                  <span>→</span>
                </div>
              </div>
              <CardContent className="pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{meta.title}</h3>
                  <Badge variant="secondary">{tag}</Badge>
                  {(meta.badges || []).map((b, i) => (
                    <Badge key={i} variant={b.variant}>
                      {b.label}
                    </Badge>
                  ))}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{meta.description}</p>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
