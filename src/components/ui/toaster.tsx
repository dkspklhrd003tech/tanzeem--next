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

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
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
                className={`pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-xl border p-4 pr-6 shadow-2xl group ${variant === 'destructive'
                    ? 'bg-destructive text-destructive-foreground border-destructive'
                    : 'bg-card text-card-foreground border-border'
                  }`}
              >
                <div className="grid gap-1">
                  {title && <ToastTitle className="text-lg font-bold tracking-tight">{title}</ToastTitle>}
                  {description && (
                    <ToastDescription className="text-sm font-medium opacity-90">{description}</ToastDescription>
                  )}
                </div>
                {action}
                <ToastClose className={`absolute right-2 top-2 rounded-md p-1 transition-opacity opacity-70 hover:opacity-100 ${variant === 'destructive' ? 'text-destructive-foreground hover:bg-destructive-foreground/20' : 'text-foreground/50 hover:bg-secondary hover:text-foreground'
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