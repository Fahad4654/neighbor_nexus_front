"use client";

import { useEffect, useMemo } from "react";
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
        const newPos = e.target.getLatLng();
        onLocationChange(newPos);
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
  // Prevent SSR hydration issues
  if (typeof window === "undefined") return null;

  const position: LatLngExpression = location
    ? [location.lat, location.lng]
    : [51.505, -0.09];

  return (
    // Key ensures MapContainer doesn't double-initialize
    <div key="leaflet-map" className="h-full w-full">
      <MapContainer
        center={[51.505, -0.09]} // static initial center (Leaflet requirement)
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
