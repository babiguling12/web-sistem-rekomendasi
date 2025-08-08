'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getCategoryByElevation, mapWeatherCodeToDescription } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Star, CloudSun, Activity } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';

const GEOAPIFY_KEY = '127ff7e3eabd4484b3db25a082ee6d62';
const FOURSQUARE_KEY = 'fsq3fuXG1UpBrEPokg1hPjcotnEi1/1GNAzRBPRc7jqsJCk=';
const GOOGLE_API_KEY = 'AIzaSyB58eeMbdhYPMCt3PLE0Fv75yLkj86Onj4';
const GOOGLE_CX = 'a7bc6cf99bcc24a69';

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
  activityLevel: string;
};

export default function DestinationsPageWrapper() {
  return (
    <Suspense fallback={<div className="container py-16 text-center">Loading destinations...</div>}>
      <DestinationsPage />
    </Suspense>
  );
}

function DestinationsPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const placesPerPage = 10;

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      setCurrentPage(parseInt(pageParam));
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchDestinations() {
      try {
        setIsLoading(true);

        const cached = sessionStorage.getItem('allDestinations');
        if (cached) {
          console.log('💾 Loaded from sessionStorage');
          setPlaces(JSON.parse(cached));
          setIsLoading(false);
          return;
        }

        console.log('🌐 Fetching from API');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/destinations`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();

        const rawPlaces = data.results.map((item: any) => ({
          id: item.id || item.kode || `id-${Math.random().toString(36).substring(2, 9)}`,
          name: item.name || item.nama,
          location: item.location || item.kabupaten || 'Bali',
          lat: item.lat || item.latitude,
          lon: item.lon || item.longitude,
          distance: 'N/A',
          category: item.category || 'Wisata',
          activityLevel: item.activity || 'relaxed',
        }));

        const enriched = await Promise.all(rawPlaces.map(enrichPlace));

        setPlaces(enriched);
        sessionStorage.setItem('allDestinations', JSON.stringify(enriched));
      } catch (err) {
        console.error('Error fetching destinations:', err);
        setError(err instanceof Error ? err.message : 'Gagal memuat destinasi.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDestinations();
  }, []);

  async function fetchGoogleImage(query: string): Promise<string | null> {
    try {
      const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${GOOGLE_CX}&key=${GOOGLE_API_KEY}&searchType=image&num=1`;
      const res = await fetch(url);
      const data = await res.json();
      return data.items?.[0]?.link || null;
    } catch (e) {
      console.warn('Google CSE error:', e);
      return null;
    }
  }

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

      const popularity = (4 + Math.random()).toFixed(1);

      const image =
        (await fetchFoursquareImage(place.name, place.lat, place.lon)) ||
        (await fetchGoogleImage(`${place.name} bali`)) ||
        `https://source.unsplash.com/featured/?bali,${place.category}`;

      return {
        ...place,
        weather,
        popularity,
        description: `${place.category} di ${place.location} dengan pemandangan alam yang indah cocok untuk kamu yang memiliki level aktivitas ${place.activityLevel}.`,
        image,
      };
    } catch (error) {
      console.error('Error enriching place:', error);
      return {
        ...place,
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

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    router.push(`?page=${pageNumber}`);
  };

  if (isLoading) return <div className="container py-16 text-center">Memuat destinasi wisata...</div>;
  if (error) return <div className="container py-16 text-center text-red-600">{error}</div>;
  if (places.length === 0) return <div className="container py-16 text-center">Tidak ada destinasi wisata.</div>;

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Tempat Wisata di Bali</h1>
      <p className="text-center text-sm text-muted-foreground mb-6">Menampilkan {places.length} destinasi</p>

      {currentPlaces.map((place) => (
        <Link href={`/destinations/${place.id}?source=all&page=${currentPage}`} key={place.id}>
          <Card className="overflow-hidden mb-6 hover:shadow-lg transition">
            <div className="md:flex">
              <div className="relative h-48 md:h-auto md:w-1/3">
                <Image src={place.image || '/placeholder.svg'} alt={place.name} fill className="object-cover" />
              </div>
              <CardContent className="p-6 md:w-2/3">
                <h2 className="text-xl font-bold">{place.name}</h2>
                <div className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{place.location}</span>
                </div>
                <p className="text-sm mb-2">{place.description}</p>
                <div className="flex gap-2 text-xs">
                  <span className="flex items-center gap-1">
                    <CloudSun className="h-3 w-3" />
                    {place.weather}
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    {place.activityLevel}
                  </span>
                </div>
              </CardContent>
            </div>
          </Card>
        </Link>
      ))}

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent className="flex justify-center flex-wrap gap-2">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                className={`px-3 py-1 border rounded-md ${
                  currentPage === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100'
                }`}
              />
            </PaginationItem>

            {/* Windowed pagination */}
            {(() => {
              const windowSize = 5; // max 5 nomor
              let startPage = Math.max(1, currentPage - Math.floor(windowSize / 2));
              let endPage = startPage + windowSize - 1;

              if (endPage > totalPages) {
                endPage = totalPages;
                startPage = Math.max(1, endPage - windowSize + 1);
              }

              const pages = [];
              for (let page = startPage; page <= endPage; page++) {
                pages.push(
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => paginate(page)}
                      className={`px-3 py-1 border rounded-md cursor-pointer ${
                        page === currentPage ? 'bg-primary text-white' : 'hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }

              return pages;
            })()}

            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                className={`px-3 py-1 border rounded-md ${
                  currentPage === totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100'
                }`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <div className="mt-6 text-center">
        <Button variant="outline" onClick={() => router.back()}>
          Kembali
        </Button>
      </div>
    </div>
  );
}
