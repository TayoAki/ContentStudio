export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-80 w-full max-w-sm rounded-xl" />
    </div>
  );
}
