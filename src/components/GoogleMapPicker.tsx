'use client';

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { LocateFixed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 34.052235,
  lng: -118.243683,
};

const libraries: ('places' | 'drawing' | 'geometry' | 'localContext' | 'visualization')[] = ['places'];

interface GoogleMapPickerProps {
  onLocationChange: (location: { lat: number; lng: number }) => void;
}

export default function GoogleMapPicker({ onLocationChange }: GoogleMapPickerProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const mapRef = useRef<google.maps.Map | null>(null);
  const { toast } = useToast();

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleLocationUpdate = (newPos: { lat: number; lng: number }) => {
    setMarkerPosition(newPos);
    onLocationChange(newPos);
  };

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      handleLocationUpdate({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  }, [onLocationChange]);
  
  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      handleLocationUpdate({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  }, [onLocationChange]);

  const goToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          handleLocationUpdate(newPos);
          mapRef.current?.panTo(newPos);
          mapRef.current?.setZoom(15);
        },
        () => {
          toast({
            variant: 'destructive',
            title: 'Geolocation Error',
            description: 'Could not get your current location. Please enable location services in your browser.',
          });
        }
      );
    } else {
      toast({
        variant: 'destructive',
        title: 'Geolocation Not Supported',
        description: 'Your browser does not support geolocation.',
      });
    }
  };


  if (loadError) {
    return <div className="flex items-center justify-center h-full">Error loading map</div>;
  }

  if (!isLoaded) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <div className="relative h-full w-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={8}
        center={defaultCenter}
        onClick={onMapClick}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        <Marker
          position={markerPosition}
          draggable={true}
          onDragEnd={onMarkerDragEnd}
        />
      </GoogleMap>
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="absolute bottom-4 right-4 z-10 bg-background/80 hover:bg-background"
        onClick={goToCurrentLocation}
        title="Go to my current location"
      >
        <LocateFixed className="h-5 w-5" />
      </Button>
    </div>
  );
}
