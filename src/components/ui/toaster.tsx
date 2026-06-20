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
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const getToastStyles = (title?: string, description?: string, variant?: string) => {
    if (variant === 'destructive') {
      return 'border-red-500/20 bg-red-950/60 text-red-200 backdrop-blur-md shadow-[0_8px_32px_rgba(239,68,68,0.15)]';
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
      t.includes("transmit") ||
      t.includes("published") ||
      t.includes("active")
    ) {
      return "border-emerald-500/20 bg-emerald-950/60 text-emerald-200 backdrop-blur-md shadow-[0_8px_32px_rgba(16,185,129,0.15)]";
    }
    if (
      t.includes("error") || 
      t.includes("invalid") || 
      t.includes("failed") || 
      t.includes("delete") || 
      t.includes("remove")
    ) {
      return "border-red-500/20 bg-red-950/60 text-red-200 backdrop-blur-md shadow-[0_8px_32px_rgba(239,68,68,0.15)]";
    }
    if (
      t.includes("warning") || 
      t.includes("caution") || 
      t.includes("attention") || 
      t.includes("awaiting")
    ) {
      return "border-amber-500/20 bg-amber-950/60 text-amber-200 backdrop-blur-md shadow-[0_8px_32px_rgba(245,158,11,0.15)]";
    }
    if (t.includes("identity") || t.includes("matrix") || t.includes("config")) {
      return "border-indigo-500/20 bg-indigo-950/60 text-indigo-200 backdrop-blur-md shadow-[0_8px_32px_rgba(79,70,229,0.15)]";
    }

    return "border-slate-800 bg-slate-950/60 text-slate-100 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]";
  };

  const getToastIcon = (title?: string, description?: string, variant?: string) => {
    if (variant === 'destructive') {
      return <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]" />;
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
      t.includes("transmit") ||
      t.includes("published") ||
      t.includes("active")
    ) {
      return <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />;
    }
    if (
      t.includes("error") || 
      t.includes("invalid") || 
      t.includes("failed") || 
      t.includes("delete") || 
      t.includes("remove")
    ) {
      return <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]" />;
    }
    if (
      t.includes("warning") || 
      t.includes("caution") || 
      t.includes("attention") || 
      t.includes("awaiting")
    ) {
      return <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" />;
    }
    return <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />;
  };

  return (
    <ToastProvider duration={5000}>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const dynamicStyles = getToastStyles(
          typeof title === 'string' ? title : undefined,
          typeof description === 'string' ? description : undefined,
          variant ?? undefined
        );

        const toastIcon = getToastIcon(
          typeof title === 'string' ? title : undefined,
          typeof description === 'string' ? description : undefined,
          variant ?? undefined
        );

        return (
          <Toast
            key={id}
            {...props}
            className={cn(
              "transition-all duration-300 flex items-start gap-3 border",
              dynamicStyles,
              props.className
            )}
          >
            {toastIcon}
            <div className="grid gap-1 flex-1">
              {title && <ToastTitle className="text-sm font-bold tracking-tight">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-xs font-semibold opacity-85 leading-normal">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className={cn(
              "absolute right-2 top-2 rounded-md p-1 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100",
              variant === 'destructive' 
                ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            )} />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}