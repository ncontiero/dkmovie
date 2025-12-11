import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface AnimatedRouteProps extends ComponentProps<"div"> {}

export function AnimatedRoute({ className, ...props }: AnimatedRouteProps) {
  return (
    <div
      className={cn("animate-in fade-in duration-1000", className)}
      {...props}
    />
  );
}
