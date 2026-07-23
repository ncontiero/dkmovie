import {
  type ButtonProps as ReactEmailButtonProps,
  Button as ReactEmailButton,
} from "react-email";
import { cn } from "../utils/cn";

interface ButtonProps extends ReactEmailButtonProps {
  readonly variant?: "primary" | "outline";
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <ReactEmailButton
      className={cn(
        "rounded-[6px] px-5 py-3 text-center font-semibold text-foreground no-underline",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "outline" &&
          "border border-solid border-primary text-primary",
        className,
      )}
      {...props}
    />
  );
}
