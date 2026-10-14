import clsx from "clsx";

interface SkeletonProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={clsx("skeleton", className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
