import {
  type LinkComponentProps,
  Link as RouterLink,
} from "@tanstack/react-router";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const linkVariants = cva(
  `
    ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center font-medium
    underline-offset-4 duration-200 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2
    focus-visible:outline-hidden active:opacity-70
  `,
  {
    variants: {
      variant: {
        default: "text-primary",
        destructive:
          "text-destructive hover:text-destructive/90 focus-visible:ring-destructive",
        ghost: `
          hover:text-primary-foreground focus-visible:text-primary-foreground px-0.5
          shadow-[var(--primary)_0_-2px_0_0_inset] hover:no-underline hover:shadow-[var(--primary)_0_-30px_0_-1px_inset]
          focus-visible:shadow-[var(--primary)_0_-30px_0_-1px_inset] focus-visible:ring-transparent
        `,
        muted: "text-muted-foreground hover:text-foreground text-base",
      },
      size: {
        sm: "text-sm",
        default: "text-base",
        lg: "text-lg",
      },
      radius: {
        sm: "rounded-sm",
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none",
      },
    },
    compoundVariants: [
      {
        variant: ["ghost"],
        className: "rounded-none",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      radius: "default",
    },
  },
);

export interface LinkProps
  extends LinkComponentProps, VariantProps<typeof linkVariants> {}

export function Link({
  variant,
  size,
  radius,
  className,
  ...props
}: LinkProps) {
  return (
    <RouterLink
      className={cn(linkVariants({ variant, size, radius, className }))}
      {...props}
    />
  );
}
