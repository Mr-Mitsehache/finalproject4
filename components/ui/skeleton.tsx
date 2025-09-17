type SkeletonProps = {
  variant?: "line" | "circle" | "card" | "block";
  className?: string;
};

export function Skeleton({ variant = "line", className = "" }: SkeletonProps) {
  let base = "skeleton-shimmer bg-gradient-to-br " +
             "from-zinc-200/70 to-zinc-300/50 " +
             "dark:from-zinc-800/70 dark:to-zinc-700/50 " +
             "border border-zinc-300/50 dark:border-zinc-600/50 shadow-inner ";

  switch (variant) {
    case "circle":
      base += "rounded-full h-10 w-10";
      break;
    case "card":
      base += "rounded-xl h-24 w-full";
      break;
    case "block":
      base += "rounded-xl h-40 w-full";
      break;
    default: // line
      base += "rounded-md h-4 w-full";
  }

  return <div className={base + " " + className} />;
}
