"use client";

import { useEffect, useState } from "react";

export function ClientReady({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Opening workspace…
      </div>
    );
  }
  return <>{children}</>;
}
