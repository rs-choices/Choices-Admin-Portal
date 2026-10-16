export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`ca-pulse rounded-xl bg-white shadow-card ${className}`} />;
}
