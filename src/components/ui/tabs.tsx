"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const TabsVariantContext = React.createContext<"default" | "bubble" | "pill" | "underline">("default")

export interface TabsProps extends React.ComponentProps<typeof TabsPrimitive.Root> {
  variant?: "default" | "bubble" | "pill" | "underline"
}

function Tabs({
  className,
  variant = "default",
  ...props
}: TabsProps) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.Root
        data-slot="tabs"
        className={cn("flex flex-col gap-2 w-full", className)}
        {...props}
      />
    </TabsVariantContext.Provider>
  )
}

const tabsListVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground h-12 w-fit rounded-full p-[3px]",
        bubble: "mb-6 bg-primary-light border-b border-border w-full justify-start rounded-full h-auto p-4 gap-2 gap-y-2 flex-wrap shadow-sm",
        pill: "bg-transparent border border-border/50 p-1 rounded-full h-auto flex overflow-x-auto gap-1 w-full max-w-3xl mb-8",
        underline: "bg-transparent border-b border-border w-full justify-start h-auto p-0 gap-4 flex-nowrap overflow-x-auto",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const variant = React.useContext(TabsVariantContext)
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,1.4,0.3,1)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "h-[calc(100%-1px)] flex-1 gap-1.5 rounded-full px-3 py-1 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:bg-primary-light/80 data-[state=inactive]:text-foreground data-[state=active]:shadow-sm focus-visible:ring-[3px] focus-visible:outline-1 focus-visible:border-ring focus-visible:ring-ring/50",
        bubble: "rounded-full px-4 py-2 text-sm font-semibold gap-2 border border-transparent data-[state=inactive]:border-primary data-[state=inactive]:text-foreground-muted data-[state=inactive]:bg-primary-light/80 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md active:scale-95",
        pill: "rounded-full px-4 py-2 text-sm font-medium gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:hover:bg-muted/50 data-[state=inactive]:text-foreground-muted active:scale-95",
        underline: "rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground hover:text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const variant = React.useContext(TabsVariantContext)
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        tabsTriggerVariants({ variant }),
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none animate-in fade-in-50 duration-500", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
