import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 gap-1.5 [&>svg]:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden hover:shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-blue-100 text-blue-900 [a&]:hover:bg-blue-200",
        secondary:
          "border-transparent bg-slate-100 text-slate-900 [a&]:hover:bg-slate-200",
        destructive:
          "border-transparent bg-red-100 text-red-900 [a&]:hover:bg-red-200 focus-visible:ring-red-500",
        success:
          "border-transparent bg-emerald-100 text-emerald-900 [a&]:hover:bg-emerald-200",
        warning:
          "border-transparent bg-amber-100 text-amber-900 [a&]:hover:bg-amber-200",
        outline:
          "border-slate-300 text-slate-900 [a&]:hover:bg-slate-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface BadgeProps extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {
  asChild?: boolean
  ariaLabel?: string
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    className, 
    variant,
    asChild = false,
    ariaLabel,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "span"

    return (
      <Comp
        ref={ref}
        data-slot="badge"
        aria-label={ariaLabel}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
