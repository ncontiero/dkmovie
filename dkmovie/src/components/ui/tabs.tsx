import type { ComponentProps } from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        `
          group/tabs-list inline-flex w-full gap-1 rounded-lg bg-transparent p-0.75 text-muted-foreground
          group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col
          data-[variant=line]:rounded-none
        `,
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        `
          flex items-center gap-2 rounded-md border-t-4 border-transparent px-4 py-3 text-sm font-medium text-nowrap
          ring-ring outline-hidden duration-200 not-disabled:hover:bg-secondary focus:bg-secondary focus:ring-2
          disabled:cursor-not-allowed disabled:opacity-70 data-[state=active]:border-primary
          data-[state=active]:text-foreground not-[&:hover]:data-[state=active]:bg-secondary/60 md:border-t-0 md:border-l-4
          md:px-2
        `,
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        `
          mt-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          focus-visible:outline-none
        `,
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
