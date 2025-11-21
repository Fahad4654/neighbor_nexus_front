'use client';

import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';

type LocationPickerProps = {
  location: { lat: number; lng: number } | null;
  onLocationChange: (location: { lat: number; lng: number }) => void;
};

function DraggableMarker({ onLocationChange, position }: { onLocationChange: (location: { lat: number; lng: number }) => void, position: LatLngExpression }) {

  const map = useMapEvents({
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
    [onLocationChange],
  );

  return (
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
      <DraggableMarker onLocationChange={onLocationChange} position={initialPosition} />
    </MapContainer>
  );
}
