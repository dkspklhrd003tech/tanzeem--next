import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  title?: string
  description?: string
  onConfirm: () => void | Promise<void>
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
  titleClassName?: string
  contentClassName?: string
  pendingContentClassName?: string
  confirmText?: string
  pendingText?: string
  isDestructive?: boolean
}

export function ConfirmDialog({
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete this item from our servers.",
  onConfirm,
  open,
  onOpenChange,
  children,
  titleClassName,
  contentClassName,
  pendingContentClassName,
  confirmText = "Confirm",
  pendingText,
  isDestructive,
}: ConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)

  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const handleOpenChange = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  const handleConfirm = async (e: React.MouseEvent) => {
    // Prevent AlertDialogAction from auto-closing before we finish
    e.preventDefault()
    setIsPending(true)
    try {
      await Promise.resolve(onConfirm())
    } finally {
      setIsPending(false)
      handleOpenChange(false)
    }
  }

  const isDeleteAction = isDestructive || title?.toLowerCase().includes("delete")
  const resolvedTitleClassName = cn(
    titleClassName || (title === "Delete User" || isDeleteAction ? "text-[#ff0000]" : "")
  )
  const resolvedPendingText = pendingText || (isDeleteAction ? "Deleting…" : "Saving…")
  const resolvedPendingContentClass = pendingContentClassName || (isDeleteAction ? "!bg-[#ffb3b3] !border-red-300" : "")

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && (
        <AlertDialogTrigger asChild>
          {children}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent
        style={
          isPending && (isDeleteAction || pendingContentClassName)
            ? { backgroundColor: "#ffb3b3" }
            : undefined
        }
        className={cn(
          "transition-colors duration-200",
          contentClassName,
          isPending && resolvedPendingContentClass
        )}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className={resolvedTitleClassName}>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            className="cursor-pointer border-transparent bg-red-600 hover:bg-red-700 active:bg-red-800 focus:bg-red-700 focus-visible:bg-red-700 focus-visible:ring-red-500 text-white hover:text-white active:text-white focus-visible:text-white"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="cursor-pointer bg-primary hover:bg-primary/80 active:bg-primary/90 text-white"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                {resolvedPendingText}
              </span>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
