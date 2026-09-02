"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import type { MapStop } from "@/lib/geo";
import { dayColor } from "@/lib/geo";
import "leaflet/dist/leaflet.css";

function pinIcon(stop: MapStop, selected: boolean) {
  const color = stop.kind === "stay" ? "#2f4a3c" : dayColor(stop.dayIndex);
  const size = selected ? 34 : 28;
  const label = stop.kind === "stay" ? "H" : String(stop.sequence);
  return L.divIcon({
    className: "voyage-pin",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:999px;
      background:${color};color:#fffaf2;display:flex;align-items:center;justify-content:center;
      font:650 12px Figtree,sans-serif;border:2px solid #fffaf2;
      box-shadow:0 8px 18px -10px rgba(28,25,20,.7);
      transform:${selected ? "scale(1.08)" : "none"};
    ">${label}</div>`,
  });
}

function FitBounds({ points, selected }: { points: [number, number][]; selected?: [number, number] }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|") + (selected?.join(",") ?? "");
  useEffect(() => {
    if (selected) {
      map.flyTo(selected, Math.max(map.getZoom(), 11), { duration: 0.45 });
      return;
    }
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 11);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 11 });
  }, [map, key, points, selected]);
  return null;
}

export function ItineraryMapView({
  stops,
  route,
  selectedId,
  followSelected = false,
  onSelect,
}: {
  stops: MapStop[];
  route: [number, number][];
  selectedId?: string;
  followSelected?: boolean;
  onSelect: (id: string) => void;
}) {
  const selected = followSelected ? stops.find((stop) => stop.id === selectedId) : undefined;
  const boundsPoints = useMemo<[number, number][]>(
    () => (stops.length ? stops.map((s) => [s.lat, s.lng]) : route),
    [stops, route],
  );
  const center = boundsPoints[0] ?? [46.05, 14.5];

  return (
    <MapContainer
      center={center}
      zoom={8}
      scrollWheelZoom
      className="h-full w-full"
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {route.length > 1 ? (
        <Polyline positions={route} pathOptions={{ color: "#2f4a3c", weight: 3, opacity: 0.7 }} />
      ) : null}
      {stops.map((stop) => (
        <Marker
          key={stop.id}
          position={[stop.lat, stop.lng]}
          icon={pinIcon(stop, stop.id === selectedId)}
          eventHandlers={{ click: () => onSelect(stop.id) }}
        >
          <Tooltip direction="top" offset={[0, -12]}>
            <span className="font-semibold">{stop.title}</span>
          </Tooltip>
        </Marker>
      ))}
      <FitBounds
        points={boundsPoints}
        selected={selected ? [selected.lat, selected.lng] : undefined}
      />
    </MapContainer>
  );
}
