'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Star, ArrowLeft, Activity, CloudSun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCategoryByElevation, mapWeatherCodeToDescription } from '@/lib/utils';

const API_KEY = '127ff7e3eabd4484b3db25a082ee6d62';

interface FormData {
  district?: string;
  terrainType?: string;
  timeOfDay?: string;
  activityLevel?: string;
  coordinates?: { lat: number; lng: number };
}

export default function ResultsPage() {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [places, setPlaces] = useState<any[]>([]);

  useEffect(() => {
    const storedParams = sessionStorage.getItem('recommendationParams');
    const storedCoords = sessionStorage.getItem('userCoordinates');

    if (storedParams) {
      const parsed = JSON.parse(storedParams);
      if (storedCoords) {
        parsed.coordinates = JSON.parse(storedCoords);
      }
      setFormData(parsed);

      if (parsed.coordinates) {
        fetchPlaces(parsed);
      } else {
        setIsLoading(false); // fallback
      }
    }
  }, []);

  async function fetchPlaces(params: FormData) {
    const lat = params.coordinates.lat;
    const lng = params.coordinates.lng;
    const radius = 20000; // 20 km dari user
    const center = `${lng},${lat}`;
    const filter = `circle:${center},${radius}`;

    let category = 'natural.water'; // default perairan
    if (params.terrainType === 'highland') category = 'natural.mountain,natural.peak';
    else if (params.terrainType === 'lowland') category = 'park,natural.forest';

    const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=${filter}&bias=proximity:${center}&limit=10&apiKey=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    const enriched = await Promise.all(data.features.map(async (f: any) => {
      const lat = f.geometry.coordinates[1];
      const lon = f.geometry.coordinates[0];
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weathercode,temperature_2m&timezone=Asia%2FBangkok`
      );
      const weatherData = await weatherRes.json();

      return {
        id: f.properties.place_id,
        name: f.properties.name || f.properties.address_line1 || 'Tempat tanpa nama',
        location: f.properties.city || f.properties.county || 'Bali',
        distance: (f.properties.distance / 1000).toFixed(1) + ' km',
        popularity: (Math.random() * 1.5 + 3.5).toFixed(1),
        weather: `${mapWeatherCodeToDescription(weatherData.current.weathercode)}, ${weatherData.current.temperature_2m}°C`,
        activityLevel: params.activityLevel || 'Sedang',
        image: 'https://source.unsplash.com/featured/?bali,nature',
        description: f.properties.categories?.join(', ') || 'Destinasi wisata di Bali',
      };
    }));

    setPlaces(enriched);
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg">Memuat hasil rekomendasi...</p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <Link href="/recommendation" className="flex items-center text-sm mb-8 hover:text-emerald-600">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Pencarian
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tighter mb-2">Hasil Rekomendasi Wisata</h1>
        <p className="text-muted-foreground">Berikut destinasi terdekat yang cocok dengan preferensimu</p>
        {formData && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {formData.district && (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                {formData.district}
              </span>
            )}
            {formData.terrainType && (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                {formData.terrainType === 'highland'
                  ? 'Dataran Tinggi'
                  : formData.terrainType === 'lowland'
                    ? 'Dataran Rendah'
                    : 'Perairan'}
              </span>
            )}
            {formData.timeOfDay && (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                {formData.timeOfDay === 'morning'
                  ? 'Pagi'
                  : formData.timeOfDay === 'afternoon'
                    ? 'Siang'
                    : 'Sore'}
              </span>
            )}
            {formData.activityLevel && (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                {formData.activityLevel === 'relaxed'
                  ? 'Santai'
                  : formData.activityLevel === 'moderate'
                    ? 'Sedang'
                    : 'Ekstrem'}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {places.map((place) => (
          <Card key={place.id} className="overflow-hidden">
            <div className="md:flex">
              <div className="relative h-48 md:h-auto md:w-1/3">
                <Image src={place.image} alt={place.name} fill className="object-cover" />
              </div>
              <CardContent className="p-6 md:w-2/3">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{place.name}</h2>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{place.location} • {place.distance}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400 mr-1" />
                    <span className="font-medium">{place.popularity}</span>
                  </div>
                </div>

                <p className="text-sm mb-4">{place.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="flex items-center text-xs bg-muted px-2 py-1 rounded-full">
                    <CloudSun className="h-3 w-3 mr-1" />
                    <span>{place.weather}</span>
                  </div>
                  <div className="flex items-center text-xs bg-muted px-2 py-1 rounded-full">
                    <Activity className="h-3 w-3 mr-1" />
                    <span>{place.activityLevel}</span>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-start mt-8">
        <Button variant="outline" className="mr-4">
          <Link href="/recommendation" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ubah Preferensi
          </Link>
        </Button>
      </div>
    </div>
  );
}
