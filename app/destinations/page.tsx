'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCategoryByElevation, mapWeatherCodeToDescription } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MapPin, Star, CloudSun, Activity
} from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import React from 'react';

const GEOAPIFY_KEY = '127ff7e3eabd4484b3db25a082ee6d62';
const FOURSQUARE_KEY = 'fsq3fuXG1UpBrEPokg1hPjcotnEi1/1GNAzRBPRc7jqsJCk=';

type Place = {
  id: string;
  name: string;
  location: string;
  distance: string;
  lat: number;
  lon: number;
  category: string;
  image: string;
  description: string;
  popularity: string;
  weather: string;
};

const DestinationsPage = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const placesPerPage = 10;

  const baliRect = '114.432,-9.135,115.712,-8.045';

  useEffect(() => {
    async function fetchPlaces() {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://api.geoapify.com/v2/places?categories=natural,tourism.sights&filter=rect:${baliRect}&limit=100&apiKey=${GEOAPIFY_KEY}`
        );
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
        const data = await response.json();

        const rawPlaces = data.features.map((f: any) => ({
          id: f.properties.place_id || `place-${Math.random().toString(36).substring(2, 9)}`,
          name: f.properties.name || f.properties.formatted || '',
          location: f.properties.city || f.properties.county || 'Bali',
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
          distance: 'N/A',
          category: f.properties.categories?.[0] || 'lainnya',
        })).filter((p: any) => p.name && !p.name.toLowerCase().includes('unnamed'));

        const enriched = await Promise.all(rawPlaces.map(enrichPlace));
        setPlaces(enriched);
        sessionStorage.setItem("lastSearchPlaces", JSON.stringify(enriched));
      } catch (err) {
        console.error('Error fetching places:', err);
        setError(err instanceof Error ? err.message : 'Failed to load destinations');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlaces();
  }, []);

  async function fetchFoursquareImage(name: string, lat: number, lon: number): Promise<string | null> {
    try {
      const searchUrl = `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(name)}&ll=${lat},${lon}&limit=1`;
      const searchRes = await fetch(searchUrl, {
        headers: { Authorization: FOURSQUARE_KEY },
      });
      const searchData = await searchRes.json();
      const place = searchData.results?.[0];
      if (!place) return null;

      const photoUrl = `https://api.foursquare.com/v3/places/${place.fsq_id}/photos`;
      const photoRes = await fetch(photoUrl, {
        headers: { Authorization: FOURSQUARE_KEY },
      });
      const photos = await photoRes.json();
      if (photos.length > 0) {
        const { prefix, suffix } = photos[0];
        return `${prefix}original${suffix}`;
      }
      return null;
    } catch (err) {
      console.warn('Foursquare error:', err);
      return null;
    }
  }

  async function enrichPlace(place: any): Promise<Place> {
    try {
      const weatherResp = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}&current=weathercode,temperature_2m&timezone=Asia/Bangkok`
      );
      const weatherData = await weatherResp.json();
      const weatherCode = weatherData.current?.weathercode || 0;
      const temperature = weatherData.current?.temperature_2m || 28;
      const weather = `${mapWeatherCodeToDescription(weatherCode)}, ${temperature}°C`;

      const category = getCategoryByElevation(
        place.category.includes('mountain') || place.category.includes('peak') ? 1000 :
        place.category.includes('beach') || place.category.includes('water') ? 10 :
        500
      );
      const popularity = (4 + Math.random()).toFixed(1);

      const image = await fetchFoursquareImage(place.name, place.lat, place.lon) ||
        `https://source.unsplash.com/featured/?bali,${category.toLowerCase().replace(' ', ',')}`;

      return {
        ...place,
        category,
        weather,
        popularity,
        description: `${category} di ${place.location} dengan pemandangan alam yang indah.`,
        image,
      };
    } catch (error) {
      console.error('Error enriching place:', error);
      return {
        ...place,
        category: getCategoryByElevation(500),
        weather: 'Cerah, 28°C',
        popularity: '4.5',
        description: 'Destinasi wisata alam di Bali.',
        image: 'https://source.unsplash.com/featured/?bali,nature',
      };
    }
  }

  const indexOfLastPlace = currentPage * placesPerPage;
  const indexOfFirstPlace = indexOfLastPlace - placesPerPage;
  const currentPlaces = places.slice(indexOfFirstPlace, indexOfLastPlace);
  const totalPages = Math.ceil(places.length / placesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg">Memuat destinasi wisata...</p>
      </div>
    );
  }

  if (error && places.length === 0) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          <p>Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tighter mb-2">Tempat Wisata di Bali</h1>
        <p className="text-muted-foreground">Jelajahi keindahan alam Pulau Dewata</p>
        <p className="text-sm text-muted-foreground mt-2">Menampilkan {places.length} destinasi</p>
      </div>

      <div>
        {currentPlaces.map((place) => (
          <Link href={`/destinations/${place.id}`} key={place.id}>
            <Card className="overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-200 mb-6">
              <div className="md:flex">
                <div className="relative h-48 md:h-auto md:w-1/3">
                  <Image src={place.image || '/placeholder.svg'} alt={place.name} fill className="object-cover" />
                </div>
                <CardContent className="p-6 md:w-2/3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold mb-1">{place.name}</h2>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{place.location}</span>
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
                      <span>{place.category}</span>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) paginate(currentPage - 1);
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) =>
                page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)
              )
              .map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      paginate(page);
                    }}
                    isActive={page === currentPage}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) paginate(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default DestinationsPage;
