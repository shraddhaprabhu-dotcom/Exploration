"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Workspace } from "@/components/workspace";
import { ClientReady } from "@/components/client-ready";
import { useVoyage } from "@/lib/store";

export default function TripPage() {
  const params = useParams<{ id: string }>();
  const setActiveTrip = useVoyage((s) => s.setActiveTrip);
  const trips = useVoyage((s) => s.trips);

  useEffect(() => {
    if (params.id && trips.some((t) => t.id === params.id)) {
      setActiveTrip(params.id);
    }
  }, [params.id, setActiveTrip, trips]);

  return (
    <ClientReady>
      <Workspace />
    </ClientReady>
  );
}
