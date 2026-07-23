import { type TextProps, Text as ReactEmailText } from "react-email";
import { cn } from "../utils/cn";

export function Text({ className, ...props }: TextProps) {
  return (
    <ReactEmailText
      className={cn("text-base text-foreground", className)}
      {...props}
    />
  );
}
