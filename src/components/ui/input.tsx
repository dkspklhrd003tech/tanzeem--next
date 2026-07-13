import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-foreground/15 bg-primary-light/30 selection:bg-primary selection:text-foreground focus:bg-primary-light/60 selection:bg-primary-light flex h-8 w-full min-w-0 rounded-xl border border-primary/30 px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed md:text-sm",
        "aria-invalid:ring-destructive/20  aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
