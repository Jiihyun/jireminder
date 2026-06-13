'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md ${className}`}
      style={{ backgroundColor: 'rgba(120,120,128,0.12)' }}
    />
  );
}

export function ReminderSkeleton() {
  return (
    <div className="space-y-2.5 px-4 py-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-2.5">
          <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className={`h-3.5 ${i % 3 === 0 ? 'w-2/3' : 'w-full'}`} />
            {i % 2 === 0 && <Skeleton className="h-3 w-1/3" />}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="px-3 py-4 space-y-3">
      {/* 스마트 카드 스켈레톤 */}
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-16 rounded-xl" />
      {/* 목록 스켈레톤 */}
      <div className="space-y-1.5 pt-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
