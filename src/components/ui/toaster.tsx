"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  const getToastStyles = (title?: string, description?: string, variant?: string) => {
    if (variant === 'destructive') {
      return 'border-destructive bg-destructive/10 text-destructive shadow-[0_4px_20px_rgba(239,68,68,0.1)]';
    }

    const t = ((title ? String(title) : "") + (description ? " " + String(description) : "")).toLowerCase();
    if (
      t.includes("success") || 
      t.includes("successfully") || 
      t.includes("saved") || 
      t.includes("created") || 
      t.includes("updated") || 
      t.includes("uploaded") || 
      t.includes("complete") || 
      t.includes("dispatched") || 
      t.includes("transmit")
    ) {
      return "border-emerald-500/20 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.05)]";
    }
    if (
      t.includes("error") || 
      t.includes("invalid") || 
      t.includes("failed") || 
      t.includes("delete") || 
      t.includes("remove")
    ) {
      return "border-rose-500/20 bg-rose-50 text-rose-900 dark:bg-rose-950/20 dark:text-rose-300 shadow-[0_4px_20px_rgba(244,63,94,0.05)]";
    }
    if (
      t.includes("warning") || 
      t.includes("caution") || 
      t.includes("attention") || 
      t.includes("awaiting")
    ) {
      return "border-amber-500/20 bg-amber-50 text-amber-900 dark:bg-amber-950/20 dark:text-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.05)]";
    }
    if (t.includes("identity") || t.includes("matrix") || t.includes("config")) {
      return "border-indigo-500/20 bg-indigo-50 text-indigo-900 dark:bg-indigo-950/20 dark:text-indigo-300 shadow-[0_4px_20px_rgba(79,70,229,0.05)]";
    }

    return "bg-background text-foreground border-border shadow-lg";
  };

  return (
    <ToastProvider duration={5000}>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const dynamicStyles = getToastStyles(
          typeof title === 'string' ? title : undefined,
          typeof description === 'string' ? description : undefined,
          variant ?? undefined
        );

        return (
          <Toast
            key={id}
            {...props}
            className={cn(
              "transition-all duration-300",
              dynamicStyles,
              props.className
            )}
          >
            <div className="grid gap-1">
              {title && <ToastTitle className="text-sm font-bold tracking-tight">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-xs font-medium opacity-90">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className={cn(
              "absolute right-2 top-2 rounded-md p-1 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100",
              variant === 'destructive' 
                ? 'text-destructive-foreground hover:bg-destructive-foreground/20' 
                : 'text-foreground/50 hover:bg-secondary hover:text-foreground'
            )} />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}