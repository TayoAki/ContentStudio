// Skeleton in the shape of the workspace, so navigation never shows a blank page.
export default function Loading() {
  return (
    <div className="flex min-w-0 flex-1" aria-busy="true" aria-label="Loading">
      <div className="hidden w-64 shrink-0 space-y-3 border-r border-line bg-surface-2 p-4 md:block">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-7" />
        <div className="skeleton h-7" />
        <div className="skeleton mt-6 h-3 w-20" />
        <div className="skeleton h-7" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-[45px] items-center gap-4 border-b border-line bg-surface px-6">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-3 w-24" />
        </div>
        <div className="space-y-4 p-6">
          <div className="skeleton h-5 w-48" />
          <div className="skeleton h-3 w-96 max-w-full" />
          <div className="skeleton h-40" />
          <div className="skeleton h-40" />
        </div>
      </div>
    </div>
  );
}
