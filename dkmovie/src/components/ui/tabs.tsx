import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  forwardRef,
} from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = forwardRef<
  ComponentRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "text-muted-foreground flex w-full gap-1 p-1 pb-1.5 md:flex-col",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = forwardRef<
  ComponentRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      `
        ring-ring flex items-center gap-2 rounded-md border-t-4 border-transparent px-4 py-3 text-sm font-medium
        text-nowrap outline-hidden duration-200 not-disabled:hover:bg-secondary focus:bg-secondary focus:ring-2
        not-[&:hover]:data-[state=active]:bg-secondary/60 data-[state=active]:border-primary
        data-[state=active]:text-foreground disabled:cursor-not-allowed disabled:opacity-70 md:border-t-0 md:border-l-4
        md:px-2
      `,
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = forwardRef<
  ComponentRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      `
        ring-offset-background mt-2 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2
        focus-visible:outline-none
      `,
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
