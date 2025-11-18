import {
  type LinkProps as RouterLinkProps,
  Link as RouterLink,
} from "react-router";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const linkVariants = cva(
  `
    ring-offset-background inline-flex items-center justify-center font-medium underline-offset-4 duration-200
    focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden
    hover:underline active:opacity-70
  `,
  {
    variants: {
      variant: {
        default: "text-primary",
        destructive:
          "text-destructive hover:text-destructive/90 focus-visible:ring-destructive",
        ghost: `
          hover:text-primary-foreground hover:no-underline hover:shadow-[var(--primary)_0_-30px_0_-1px_inset]
          focus-visible:text-primary-foreground focus-visible:shadow-[var(--primary)_0_-30px_0_-1px_inset]
          focus-visible:ring-transparent px-0.5 shadow-[var(--primary)_0_-2px_0_0_inset]
        `,
        muted: "text-muted-foreground text-base hover:text-foreground",
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
  extends RouterLinkProps,
    VariantProps<typeof linkVariants> {}

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
