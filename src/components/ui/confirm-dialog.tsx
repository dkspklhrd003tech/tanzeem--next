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

interface ConfirmDialogProps {
  title?: string
  description?: string
  onConfirm: () => void | Promise<void>
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function ConfirmDialog({
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete this item from our servers.",
  onConfirm,
  open,
  onOpenChange,
  children,
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

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && (
        <AlertDialogTrigger asChild>
          {children}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            className="cursor-pointer bg-red-600 hover:bg-red-700 text-white"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="cursor-pointer bg-[#0d5844] hover:bg-green-600 text-white"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                Saving…
              </span>
            ) : (
              "Continue"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
