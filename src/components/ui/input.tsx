import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  isError?: boolean;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, isError, helperText, "aria-label": ariaLabel, "aria-describedby": ariaDescribedBy, ...props }, ref) => {
    const helperTextId = helperText ? `${props.id || 'input'}-helper` : undefined;

    return (
      <>
        <input
          ref={ref}
          type={type}
          data-slot="input"
          aria-invalid={isError}
          aria-describedby={ariaDescribedBy || helperTextId}
          aria-label={ariaLabel || props.placeholder}
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            isError 
              ? "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border-destructive focus-visible:ring-destructive/20"
              : "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className
          )}
          {...props}
        />
        {helperText && (
          <p 
            id={helperTextId}
            className={cn(
              "text-xs mt-1.5 font-medium",
              isError ? "text-destructive" : "text-muted-foreground"
            )}
            role="status"
          >
            {helperText}
          </p>
        )}
      </>
    )
  }
)
Input.displayName = "Input"

export { Input }
