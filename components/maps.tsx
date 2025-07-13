"use client"
import { useEffect, useRef } from "react"

interface GoogleMapProps {
  userLocation: { lat: number; lng: number } | null
  destinationLocation: { lat: number; lng: number }
}

export default function GoogleMap({ userLocation, destinationLocation }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window as any).google &&
      mapRef.current &&
      destinationLocation &&
      typeof destinationLocation.lat === "number" &&
      typeof destinationLocation.lng === "number" &&
      !isNaN(destinationLocation.lat) &&
      !isNaN(destinationLocation.lng)
    ) {
      const map = new (window as any).google.maps.Map(mapRef.current, {
        zoom: 12,
        center: destinationLocation,
      })

      // Pin lokasi destinasi
      new (window as any).google.maps.Marker({
        position: destinationLocation,
        map,
        title: "Tujuan Wisata",
        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      })

      // Pin lokasi pengguna jika tersedia
      if (
        userLocation &&
        typeof userLocation.lat === "number" &&
        typeof userLocation.lng === "number" &&
        !isNaN(userLocation.lat) &&
        !isNaN(userLocation.lng)
      ) {
        new (window as any).google.maps.Marker({
          position: userLocation,
          map,
          title: "Lokasi Anda",
          icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        })
      }
    }
  }, [userLocation, destinationLocation])

  return <div ref={mapRef} style={{ height: "400px", width: "100%" }} />
}
