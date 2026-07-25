import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button-variants";
import { Spinner } from "./spinner";

export interface ButtonProps
  extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  loadingIconClassName?: string;
}

export function Button({
  className,
  loadingIconClassName,
  variant,
  size,
  loadingText,
  loading = false,
  asChild = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <>
          <Spinner className={loadingIconClassName} /> {loadingText}
        </>
      ) : (
        children
      )}
    </Comp>
  );
}
