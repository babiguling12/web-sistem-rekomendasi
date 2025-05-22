'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { ChevronLeft, CloudSun, MapPin, Star, Activity } from 'lucide-react';

const GoogleMap = dynamic(() => import('@/components/maps'), { ssr: false });

export default function DestinationDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params); // Unwrap the params promise
  const [destination, setDestination] = useState<any>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [similarPlaces, setSimilarPlaces] = useState<any[]>([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const allPlaces = sessionStorage.getItem('lastSearchPlaces');
    const coords = sessionStorage.getItem('userCoordinates');

    if (coords) setUserCoords(JSON.parse(coords));
    if (allPlaces) {
      const parsed = JSON.parse(allPlaces);
      const dest = parsed.find((p: any) => p.id === unwrappedParams.id);
      setDestination(dest);
      const filtered = parsed.filter((p: any) => p.category === dest?.category && p.id !== dest?.id).slice(0, 4);
      setSimilarPlaces(filtered);
    }
  }, [unwrappedParams.id]);

  if (!destination) {
    return (
      <div className="p-10 text-center text-gray-500">Memuat data destinasi...</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Button onClick={() => router.back()} variant="ghost" className="mb-4 flex items-center">
        <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
      </Button>

      <h1 className="text-3xl font-bold mb-2 text-center">{destination.name}</h1>

      {/* Kategori tags */}
      <div className="flex justify-center gap-2 mb-4">
        <span className="bg-gray-100 rounded-full px-3 py-1 text-xs font-medium">{destination.category}</span>
        {/* Tambahkan tag lain jika ada */}
      </div>

      {/* Gambar & tombol peta */}
      <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-4 shadow-md bg-gray-100">
        <button
          className="absolute top-2 right-2 bg-white rounded-full shadow px-3 py-1 text-xs font-medium z-10 flex items-center gap-1"
          onClick={() => setShowMap(!showMap)}
        >
          <Activity className="w-4 h-4" />
          {showMap ? 'Lihat Gambar' : 'Lihat Peta'}
        </button>
        {showMap ? (
          <GoogleMap
            userLocation={userCoords}
            destinationLocation={{ lat: destination.lat, lng: destination.lon }}
          />
        ) : (
          <img src={destination.image} alt={destination.name} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Lokasi & rating */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-700 flex items-center">
          <MapPin className="inline h-4 w-4 mr-1 text-rose-500" />
          {destination.location} • {destination.distance}
        </div>
        <div className="flex items-center text-yellow-500 text-base font-medium">
          <Star className="h-5 w-5 mr-1 fill-yellow-400 stroke-yellow-400" />
          {destination.popularity}
        </div>
      </div>

      {/* Info bawah gambar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <span className="bg-green-50 text-green-800 px-3 py-1 rounded-lg text-xs flex items-center gap-1">
          <CloudSun className="inline w-4 h-4" />
          {destination.weather}
        </span>
        <span className="bg-green-50 text-green-800 px-3 py-1 rounded-lg text-xs flex items-center gap-1">
          <Activity className="inline w-4 h-4" />
          Santai
        </span>
      </div>

      {/* Tentang Destinasi */}
      <h3 className="font-semibold mb-1">Tentang Destinasi</h3>
      <p className="text-base text-gray-800 mb-8">{destination.description}</p>

      {/* Destinasi Serupa */}
      {similarPlaces.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Destinasi Wisata Serupa</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {similarPlaces.map((place) => (
              <a
                key={place.id}
                href={`/destinations/${place.id}`}
                className="min-w-[220px] max-w-[220px] bg-white border rounded-xl overflow-hidden shadow hover:shadow-lg transition flex-shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                <img
                  src={place.image}
                  alt={place.name}
                  className="h-32 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-base mb-1">{place.name}</h3>
                  <div className="flex items-center text-xs text-muted-foreground mb-1">
                    <MapPin className="inline w-3 h-3 mr-1" />
                    {place.location} • {place.distance}
                  </div>
                  <div className="flex items-center text-yellow-500 text-xs mb-1">
                    <Star className="h-4 w-4 mr-1 fill-yellow-400 stroke-yellow-400" />
                    {place.popularity}
                  </div>
                  <p className="text-xs text-gray-700 line-clamp-2">{place.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
