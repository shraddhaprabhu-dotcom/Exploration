"use client";

import { useEffect, useState } from "react";
import { useVoyage } from "@/lib/store";

export function ClientReady({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const finish = () => setReady(true);
    const unsub = useVoyage.persist.onFinishHydration(finish);
    void useVoyage.persist.rehydrate();
    if (useVoyage.persist.hasHydrated()) finish();
    return unsub;
  }, []);
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Opening workspace…
      </div>
    );
  }
  return <>{children}</>;
}
