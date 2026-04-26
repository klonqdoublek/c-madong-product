export function TaskCardSkeleton() {
  return (
    <div className="rounded-xl border border-black/5 bg-[#fffbf1] px-3 py-4 animate-pulse">
      <div className="flex gap-2">
        <div className="w-[3px] shrink-0 self-stretch rounded-full bg-[#dd598b]/20" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-black/10" />
          <div className="flex gap-1.5">
            <div className="h-4 w-12 rounded-full bg-[#dd598b]/15" />
            <div className="h-4 w-24 rounded-full bg-black/8" />
          </div>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <div className="h-3 w-28 rounded bg-black/8" />
      </div>
      <div className="mt-3 h-10 w-full rounded-full bg-[#dd598b]/15" />
    </div>
  );
}

export function TaskCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  );
}
