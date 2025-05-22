'use client';

import { useEffect, useRef } from 'react';

interface Props {
  userLocation: { lat: number; lng: number } | null;
  destinationLocation: { lat: number; lng: number };
}

export default function GoogleMap({ userLocation, destinationLocation }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if ((window as any).google?.maps && mapRef.current) {
        clearInterval(interval);
        const map = new (window as any).google.maps.Map(mapRef.current, {
          center: destinationLocation,
          zoom: 12,
        });

        if (userLocation) {
          new (window as any).google.maps.Marker({
            position: userLocation,
            map,
            title: 'Lokasi Anda',
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          });
        }

        new (window as any).google.maps.Marker({
          position: destinationLocation,
          map,
          title: 'Destinasi',
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [userLocation, destinationLocation]);

  return <div ref={mapRef} className="w-full h-full" />;
}
