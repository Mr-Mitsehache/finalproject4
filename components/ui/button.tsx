//components\ui\button.tsx
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: `
          bg-red-600 text-white hover:bg-red-700 
          focus-visible:ring-red-500
          dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 
          dark:focus-visible:ring-blue-500
        `,
        outline: `
          border border-red-600 text-red-600 hover:bg-red-50 
          focus-visible:ring-red-500
          dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-500/20
          dark:focus-visible:ring-blue-400
        `,
        ghost: `
          text-red-600 hover:bg-red-50
          focus-visible:ring-red-500
          dark:text-blue-400 dark:hover:bg-blue-500/20
          dark:focus-visible:ring-blue-400
        `,
        destructive: `
          bg-destructive text-white hover:bg-red-700
          focus-visible:ring-red-600
          dark:bg-red-600 dark:hover:bg-red-700
        `,
        glow: `
          bg-gradient-to-r from-red-600 to-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.6)]
          hover:shadow-[0_0_20px_rgba(239,68,68,0.9)]
          focus-visible:ring-red-400
          dark:from-blue-600 dark:to-blue-500 dark:shadow-[0_0_10px_rgba(59,130,246,0.6)]
          dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.9)]
          dark:focus-visible:ring-blue-400
        `,
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
