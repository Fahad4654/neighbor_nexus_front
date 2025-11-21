'use client';

import { useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLngExpression, LatLng } from 'leaflet';

type LocationPickerProps = {
  location: { lat: number; lng: number } | null;
  onLocationChange: (location: { lat: number; lng: number }) => void;
};

function DraggableMarker({ onLocationChange, initialPosition }: { onLocationChange: (location: { lat: number; lng: number }) => void, initialPosition: LatLngExpression }) {
  const [position, setPosition] = useState<LatLng | null>(new LatLng(
      (initialPosition as any).lat,
      (initialPosition as any).lng
  ));

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationChange(e.latlng);
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend(e: any) {
        const newPos = e.target.getLatLng();
        setPosition(newPos);
        onLocationChange(newPos);
      },
    }),
    [onLocationChange],
  );

  return position === null ? null : (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      
    ></Marker>
  );
}

export default function LocationPicker({ location, onLocationChange }: LocationPickerProps) {
  const initialPosition: LatLngExpression = location 
    ? [location.lat, location.lng] 
    : [51.505, -0.09];

  return (
    <MapContainer center={initialPosition} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DraggableMarker onLocationChange={onLocationChange} initialPosition={initialPosition} />
    </MapContainer>
  );
}
