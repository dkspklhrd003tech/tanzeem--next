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
import { motion, AnimatePresence } from "framer-motion"

export function Toaster() {
  const { toasts } = useToast()

  const getToastStyles = (title?: string, description?: string, variant?: string) => {
    if (variant === 'destructive') return 'bg-destructive text-destructive-foreground border-destructive shadow-[0_0_20px_rgba(239,68,68,0.2)]';

    const t = ((title ? String(title) : "") + (description ? " " + String(description) : "")).toLowerCase();
    if (t.includes("success") || t.includes("successfully") || t.includes("saved") || t.includes("created") || t.includes("updated") || t.includes("uploaded") || t.includes("complete") || t.includes("dispatched") || t.includes("transmit")) {
      return "bg-green-600 text-[#fefefc] border-green-600 shadow-[0_0_20px_rgba(22,163,74,0.2)]";
    }
    if (t.includes("error") || t.includes("invalid") || t.includes("failed") || t.includes("delete") || t.includes("remove")) {
      return "bg-red-600 text-[#fefefc] border-red-600 shadow-[0_0_20_rgba(220,38,38,0.2)]";
    }
    if (t.includes("warning") || t.includes("caution") || t.includes("attention") || t.includes("awaiting")) {
      return "bg-yellow-600 text-[#fefefc] border-yellow-600 shadow-[0_0_20px_rgba(202,138,4,0.2)]";
    }
    if (t.includes("identity") || t.includes("matrix") || t.includes("config")) {
      return "bg-indigo-600 text-[#fefefc] border-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.2)]";
    }

    return "bg-card text-card-foreground border-border shadow-xl";
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
            className={`bg-transparent border-0 p-0 shadow-none overflow-visible data-[state=closed]:animate-none data-[state=open]:animate-none ${props.className || ''}`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.5, rotateX: 60, y: 50, z: -100 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0, z: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateX: -60, y: -20, z: -100 }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 25,
                  mass: 1.2
                }}
                style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
                className={`pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-xl border p-4 pr-6 transition-all duration-300 ${dynamicStyles}`}
              >
                <div className="grid gap-1">
                  {title && <ToastTitle className="text-lg font-bold tracking-tight">{title}</ToastTitle>}
                  {description && (
                    <ToastDescription className="text-sm font-medium opacity-90">{description}</ToastDescription>
                  )}
                </div>
                {action}
                <ToastClose className={`absolute right-2 top-2 rounded-md p-1 transition-opacity opacity-100 hover:opacity-100 ${variant === 'destructive' ? 'text-destructive-foreground hover:bg-destructive-foreground/20' : 'text-foreground/50 hover:bg-secondary hover:text-foreground'
                  }`} />
              </motion.div>
            </AnimatePresence>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}