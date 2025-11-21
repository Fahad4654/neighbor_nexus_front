'use client';

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import type { LatLngExpression, LatLng } from "leaflet";

type LocationPickerProps = {
  location: { lat: number; lng: number } | null;
  onLocationChange: (loc: { lat: number; lng: number }) => void;
};

// Component to update map center when position changes
function MapUpdater({ position }: { position: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return null;
}

// Draggable marker that calls onLocationChange on drag or click
function DraggableMarker({
  position,
  onLocationChange,
}: {
  position: LatLngExpression;
  onLocationChange: (loc: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  const eventHandlers = {
    dragend(e: any) {
      const marker = e.target;
      const latlng: LatLng = marker.getLatLng();
      onLocationChange({ lat: latlng.lat, lng: latlng.lng });
    },
  };

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
  // Default position if no location is provided
  const position: LatLngExpression = location ?? [51.505, -0.09];

  // Key for MapContainer to force re-initialization if position changes
  const mapKey = Array.isArray(position)
    ? `${position[0]}-${position[1]}`
    : `${position.lat}-${position.lng}`;

  return (
    <div className="h-full w-full">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        key={mapKey} // prevents "Map container already initialized"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <DraggableMarker position={position} onLocationChange={onLocationChange} />
      </MapContainer>
    </div>
  );
}
