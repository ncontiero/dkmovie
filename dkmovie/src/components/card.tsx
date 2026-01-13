import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface CardProps extends ComponentProps<"div"> {
  readonly asChild?: boolean;
}

export function Card({ asChild, className, ...props }: CardProps) {
  const Comp = asChild ? Slot : "div";

  return <Comp className={cn("rounded-lg border", className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col p-4 sm:p-6", className)} {...props} />
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: ComponentProps<"h3">) {
  return (
    <h3 className={cn("text-lg font-bold", className)} {...props}>
      {children}
    </h3>
  );
}
export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("text-muted-foreground mt-2 text-sm", className)}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        `
          bg-secondary/40 dark:bg-secondary/20 flex flex-col items-center justify-center gap-4 rounded-b-lg border-t
          px-6 py-2 text-center sm:flex-row sm:justify-between sm:text-start md:h-14 md:py-0
        `,
        className,
      )}
      {...props}
    />
  );
}

export function CardFooterDescription({
  className,
  ...props
}: ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...props} />
  );
}
