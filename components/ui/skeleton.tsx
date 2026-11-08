import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({
  className = "",
  shimmer = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={`rounded-md bg-muted/70 ${
        shimmer ? "animate-shimmer" : "animate-pulse"
      } ${className}`}
      {...props}
    />
  );
}

