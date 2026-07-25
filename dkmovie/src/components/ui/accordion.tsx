import type { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Accordion(props: ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

const AccordionHeader = AccordionPrimitive.Header;

function AccordionItem({
  className,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  asHeader,
  hiddenIcon = false,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger> & {
  hiddenIcon?: boolean;
  asHeader?: "div" | "h3";
}) {
  const HeaderComp = asHeader || "h3";

  return (
    <AccordionPrimitive.Header className="flex" asChild>
      <HeaderComp>
        <AccordionPrimitive.Trigger
          data-slot="accordion-trigger"
          className={cn(
            `
              flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline
              [&[data-state=open]>svg]:rotate-180
            `,
            className,
          )}
          {...props}
        >
          {children}
          {hiddenIcon ? null : (
            <ChevronDown className="size-4 shrink-0 transition-transform duration-200" />
          )}
        </AccordionPrimitive.Trigger>
      </HeaderComp>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="
        overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up
        data-[state=open]:animate-accordion-down
      "
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
};
