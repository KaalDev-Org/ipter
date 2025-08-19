import * as React from "react"

import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, style, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border-2 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{
          borderColor: '#E4F2E7',
          ...style
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#D9ECD2';
          e.target.style.boxShadow = '0 0 0 3px rgba(174, 224, 232, 0.3)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#E4F2E7';
          e.target.style.boxShadow = 'none';
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
