import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <>
      <Skeleton className="h-[60px]" />
      <Skeleton className="h-[300px]" />
    </>
  );
}
