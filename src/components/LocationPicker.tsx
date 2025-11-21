"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { LatLngExpression } from "leaflet";

type LocationPickerProps = {
  location: { lat: number; lng: number } | null;
  onLocationChange: (loc: { lat: number; lng: number }) => void;
};

// === Keeps map centered when location changes ===
function MapUpdater({ position }: { position: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [map, position]);
  return null;
}

// === Draggable + clickable marker ===
function DraggableMarker({
  position,
  onLocationChange,
}: {
  position: LatLngExpression;
  onLocationChange: (loc: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng);
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend(e: any) {
        onLocationChange(e.target.getLatLng());
      },
    }),
    [onLocationChange]
  );

  return (
    <>
      <MapUpdater position={position} />
      <Marker draggable eventHandlers={eventHandlers} position={position} />
    </>
  );
}

export default function LocationPicker({
  location,
  onLocationChange,
}: LocationPickerProps) {
  const [mounted, setMounted] = useState(false);

  // FIXES Leaflet: Prevents double initialization in Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-full">Loading map...</div>;

  const position: LatLngExpression = location
    ? [location.lat, location.lng]
    : [51.505, -0.09];

  return (
    <div className="h-full w-full">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <DraggableMarker
          position={position}
          onLocationChange={onLocationChange}
        />
      </MapContainer>
    </div>
  );
}
