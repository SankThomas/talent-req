import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ApplicationStage } from "@/types";
import { STAGE_COLORS } from "@/types";

interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "success" | "warning" | "error" | "muted";
  className?: string;
}

export function Badge({ children, variant = "muted", className }: BadgeProps) {
  const variants = {
    primary: "badge-primary",
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
    muted: "badge-muted",
  };
  return <span className={cn(variants[variant], className)}>{children}</span>;
}

export function StageBadge({
  stage,
  className,
}: {
  stage: ApplicationStage;
  className?: string;
}) {
  return (
    <span className={cn(STAGE_COLORS[stage], className)}>
      {stage.charAt(0).toUpperCase() + stage.slice(1)}
    </span>
  );
}
