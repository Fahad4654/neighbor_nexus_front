'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import type { LatLngExpression, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet's default icon URLs can break in React. This re-imports them.
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

type LocationPickerProps = {
  location: { lat: number; lng: number } | null;
  onLocationChange: (loc: { lat: number; lng: number }) => void;
};

// Component to update map center when the location prop changes
function MapUpdater({ center }: { center: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Draggable marker that calls onLocationChange on drag or click
function DraggableMarker({
  initialPosition,
  onLocationChange,
}: {
  initialPosition: LatLngExpression;
  onLocationChange: (loc: { lat: number; lng: number }) => void;
}) {
  const [position, setPosition] = useState(initialPosition);

  // Memoize event handlers to prevent re-creating them on every render
  const eventHandlers = useMemo(
    () => ({
      dragend(e: any) {
        const marker = e.target;
        const latlng: LatLng = marker.getLatLng();
        const newPos = { lat: latlng.lat, lng: latlng.lng };
        setPosition(newPos);
        onLocationChange(newPos);
      },
    }),
    [onLocationChange]
  );

  useMapEvents({
    click(e) {
      const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newPos);
      onLocationChange(newPos);
    },
  });

  // Effect to sync marker position if the external `initialPosition` prop changes.
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  return <Marker draggable eventHandlers={eventHandlers} position={position} />;
}

export default function LocationPicker({
  location,
  onLocationChange,
}: LocationPickerProps) {
  const [isMounted, setIsMounted] = useState(false);

  // This effect runs once on the client, setting the icon defaults and allowing render.
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: iconRetinaUrl.src,
      iconUrl: iconUrl.src,
      shadowUrl: shadowUrl.src,
    });
    setIsMounted(true);
  }, []);

  // Set a default position for initial render
  const defaultPosition: LatLngExpression = [51.505, -0.09];
  const currentPosition = location ?? defaultPosition;

  // Don't render the map on the server or before the client has mounted
  if (!isMounted) {
    return (
        <div className="w-full h-full flex items-center justify-center bg-muted">
            <p>Loading map...</p>
        </div>
    );
  }

  // Use a key derived from something that doesn't change, to ensure the container itself is stable.
  return (
    <MapContainer
      key="my-leaflet-map"
      center={currentPosition}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DraggableMarker
        initialPosition={currentPosition}
        onLocationChange={onLocationChange}
      />
      <MapUpdater center={currentPosition} />
    </MapContainer>
  );
}
