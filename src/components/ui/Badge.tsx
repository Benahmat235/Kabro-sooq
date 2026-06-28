import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        {
          "border-transparent bg-primary text-white hover:bg-primary-600": variant === "default",
          "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200": variant === "secondary",
          "text-gray-950": variant === "outline",
          "border-transparent bg-red-500 text-white hover:bg-red-600": variant === "destructive",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
