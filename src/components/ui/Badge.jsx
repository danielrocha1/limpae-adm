import React from "react";
import { cn } from "../../lib/utils";

export function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variant === "outline" && "border text-foreground",
        variant === "success" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        variant === "warning" && "bg-amber-500/10 text-amber-700 dark:text-amber-300",
        variant === "default" && "bg-primary/10 text-primary",
        className
      )}
      {...props}
    />
  );
}
