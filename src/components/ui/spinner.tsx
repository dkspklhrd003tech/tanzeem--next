import { cn } from "@/lib/utils";

interface SpinnerProps {
  /** Size of the spinner in pixels (maps to Tailwind size classes). Defaults to 24. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Extra classes applied to the outer wrapper */
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
  xl: "h-16 w-16 border-4",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "animate-spin rounded-full border-current border-t-transparent",
        sizeMap[size],
        "text-primary",
        className
      )}
    />
  );
}

/** Full-page centered loading fallback */
export function PageSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="xl" />
    </div>
  );
}
