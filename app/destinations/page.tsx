'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
import React from 'react';

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
          `https://api.geoapify.com/v2/places?categories=natural,tourism.sights&filter=rect:${baliRect}&limit=500&apiKey=${GEOAPIFY_KEY}`
        );
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
        const data = await response.json();

        const kabupatenList = [
          "buleleng", "jembrana", "tabanan", "badung", "gianyar",
          "bangli", "klungkung", "karangasem", "denpasar"
        ];

        const seen = new Set();
        const filteredPerKabupaten: any[] = [];

        for (const kab of kabupatenList) {
          const perKabupaten = data.features.filter((f: any) => {
            const county = f.properties.county?.toLowerCase() || '';
            const name = f.properties.name || '';
            const lat = f.geometry.coordinates[1];
            const lon = f.geometry.coordinates[0];
            const idKey = `${name}-${lat}-${lon}`;
            if (!name || !county.includes(kab)) return false;
            if (seen.has(idKey)) return false;
            seen.add(idKey);
            return true;
          }).slice(0, 20);
          filteredPerKabupaten.push(...perKabupaten);
        }

        const shuffled = filteredPerKabupaten
          .sort(() => Math.random() - 0.5)
          .slice(0, 200);

        const rawPlaces = shuffled.map((f: any) => ({
          id: f.properties.place_id || `place-${Math.random().toString(36).substring(2, 9)}`,
          name: f.properties.name || f.properties.formatted || '',
          location: f.properties.county?.toLowerCase() || 'bali',
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
          distance: 'N/A',
          category: f.properties.categories?.[0] || 'lainnya',
        }));

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

  async function fetchGoogleImage(query: string): Promise<string | null> {
    try {
      const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${GOOGLE_CX}&key=${GOOGLE_API_KEY}&searchType=image&num=1`;
      const res = await fetch(url);
      const data = await res.json();
      return data.items?.[0]?.link || null;
    } catch (e) {
      console.warn("Google CSE error:", e);
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

      const category = getCategoryByElevation(
        place.category.includes('mountain') ? 1000 :
        place.category.includes('beach') ? 10 :
        500
      );
      const popularity = (4 + Math.random()).toFixed(1);

      const image = await fetchFoursquareImage(place.name, place.lat, place.lon)
        || await fetchGoogleImage(`${place.name} bali`)
        || `https://source.unsplash.com/featured/?bali,${category}`;

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
      <div className="container py-16 text-center">Memuat destinasi wisata...</div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Tempat Wisata di Bali</h1>
      <p className="text-center text-sm text-muted-foreground mb-6">Menampilkan {places.length} destinasi</p>

      {currentPlaces.map((place) => (
        <Link href={`/destinations/${place.id}`} key={place.id}>
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
                  <span className="flex items-center gap-1"><CloudSun className="h-3 w-3" />{place.weather}</span>
                  <span className="flex items-center gap-1"><Activity className="h-3 w-3" />{place.category}</span>
                </div>
              </CardContent>
            </div>
          </Card>
        </Link>
      ))}

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => currentPage > 1 && paginate(currentPage - 1)} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => paginate(page)}
                    isActive={page === currentPage}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
            <PaginationItem>
              <PaginationNext onClick={() => currentPage < totalPages && paginate(currentPage + 1)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default DestinationsPage;
