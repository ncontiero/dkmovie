import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  forwardRef,
} from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;
const AccordionHeader = AccordionPrimitive.Header;

const AccordionItem = forwardRef<
  ComponentRef<typeof AccordionPrimitive.Item>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = forwardRef<
  ComponentRef<typeof AccordionPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    readonly hiddenIcon?: boolean;
    readonly asHeader?: "div" | "h3";
  }
>(({ className, children, hiddenIcon = false, asHeader, ...props }, ref) => {
  const HeaderComp = asHeader || "h3";

  return (
    <AccordionPrimitive.Header className="flex" asChild>
      <HeaderComp>
        <AccordionPrimitive.Trigger
          ref={ref}
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
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = forwardRef<
  ComponentRef<typeof AccordionPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="
      overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up
      data-[state=open]:animate-accordion-down
    "
    {...props}
  >
    <div className={cn("pt-0 pb-4", className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
};
