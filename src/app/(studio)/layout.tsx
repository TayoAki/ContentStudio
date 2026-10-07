import { Suspense } from "react";
import { LeftRail } from "@/components/left-rail";
import { BottomBar } from "@/components/bottom-bar";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <div className="flex min-h-0 flex-1">
        <LeftRail />
        {children}
      </div>
      <Suspense fallback={<div className="h-8 border-t border-line bg-surface" />}>
        <BottomBar />
      </Suspense>
    </div>
  );
}
