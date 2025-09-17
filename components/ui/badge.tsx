import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: `
          bg-red-600 text-white shadow-sm
          dark:bg-blue-600 dark:text-white
        `,
        outline: `
          border border-red-400 text-red-600
          dark:border-blue-400 dark:text-blue-300
        `,
        success: `
          bg-emerald-600 text-white shadow-[0_0_6px_rgba(16,185,129,0.6)]
          dark:bg-emerald-500 dark:text-white dark:shadow-[0_0_8px_rgba(16,185,129,0.7)]
        `,
        warning: `
          bg-yellow-500 text-black shadow-[0_0_6px_rgba(234,179,8,0.6)]
          dark:bg-yellow-400 dark:text-black dark:shadow-[0_0_8px_rgba(234,179,8,0.7)]
        `,
        destructive: `
          bg-red-700 text-white shadow-[0_0_6px_rgba(239,68,68,0.6)]
          dark:bg-red-600 dark:text-white dark:shadow-[0_0_8px_rgba(239,68,68,0.7)]
        `,
        info: `
          bg-sky-500 text-white shadow-[0_0_6px_rgba(14,165,233,0.6)]
          dark:bg-sky-400 dark:text-white dark:shadow-[0_0_8px_rgba(14,165,233,0.7)]
        `,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
