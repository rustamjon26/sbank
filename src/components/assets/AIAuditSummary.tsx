import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import {
  generateAIAuditSummary,
  getReplacementRecommendation,
} from "@/lib/analytics";
import { ReplacementBadge } from "@/components/assets/HealthRiskBadge";
import type { AssetIntelligence, AssetWithOwner } from "@/types";

interface AIAuditSummaryProps {
  intelligence: AssetIntelligence;
  asset: AssetWithOwner;
}

export function AIAuditSummaryCard({
  intelligence,
  asset,
}: AIAuditSummaryProps) {
  const summary = generateAIAuditSummary(intelligence, asset);
  const rec = getReplacementRecommendation(intelligence, asset);

  return (
    <Card className="rounded-3xl border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          AI Audit Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {summary}
        </p>
        <div className="flex items-center justify-between gap-3 pt-1">
          <ReplacementBadge level={rec.level} reason={rec.reason} size="md" />
        </div>
      </CardContent>
    </Card>
  );
}
