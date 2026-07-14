import type { ReactNode } from "react";
import { AppSidebar, MobileBottomNav } from "@/components/layout/app-sidebar";
import { QuickAddButton } from "@/components/shared/quick-add-button";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 hidden h-screen md:block">
        <AppSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        {children}
      </div>
      <MobileBottomNav />
      <QuickAddButton variant="fab" />
    </div>
  );
}

