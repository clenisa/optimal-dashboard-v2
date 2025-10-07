"use client";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function LLMBadge({ confidence, inferredAt }: { confidence?: number | null; inferredAt?: string | null; }) {
  const parts = ["Labeled by AI"];
  if (typeof confidence === "number") parts.push(`${Math.round(confidence * 100)}%`);
  if (inferredAt) parts.push(new Date(inferredAt).toLocaleString());
  const tip = parts.join(" • ");
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="ml-2" aria-label="Labeled by AI">🤖</Badge>
        </TooltipTrigger>
        <TooltipContent side="top">{tip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}