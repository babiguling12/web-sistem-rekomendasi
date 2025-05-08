"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { getCategoryByElevation, mapWeatherCodeToDescription } from "@/lib/utils"
import PlaceCard from "@/components/PlaceCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Star, CloudSun, Activity, ChevronLeft, ChevronRight } from 'lucide-react'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import React from "react"

const API_KEY = "127ff7e3eabd4484b3db25a082ee6d62"

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
}

type Weather = "Cerah" | "Mendung" | "Hujan"

const DestinationsPage = () => {
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const placesPerPage = 10
  
  // Calculate the bounds of Bali island approximately
  const baliRect = "114.432,-9.135,115.712,-8.045" // minLon,minLat,maxLon,maxLat

  useEffect(() => {
    async function fetchPlaces() {
      try {
        setIsLoading(true)
        
        // Fetch natural places in Bali (beaches, mountains, forests, etc.)
        const response = await fetch(
          `https://api.geoapify.com/v2/places?categories=natural,tourism.sights&filter=rect:${baliRect}&limit=100&apiKey=${API_KEY}`,
        )
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data.features || !Array.isArray(data.features)) {
          throw new Error("Invalid data format from API")
        }
        
        console.log(`Fetched ${data.features.length} places from API`)
        
        const rawPlaces = data.features.map((f: any) => ({
          id: f.properties.place_id || `place-${Math.random().toString(36).substring(2, 9)}`,
          name: f.properties.name || f.properties.formatted || "Tempat Tanpa Nama",
          location: f.properties.city || f.properties.county || "Bali",
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
          distance: "N/A", // We'll calculate this if user location is available
          category: f.properties.categories?.[0] || "lainnya",
        }))

        const enriched = await Promise.all(rawPlaces.map(enrichPlace))
        setPlaces(enriched)
      } catch (err) {
        console.error("Error fetching places:", err)
        setError(err instanceof Error ? err.message : "Failed to load destinations")
        // Provide mock data if API fails
        setPlaces(getMockPlaces())
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlaces()
  }, [])

  async function enrichPlace(place: any): Promise<Place> {
    try {
      // Get weather data
      const weatherResp = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}&current=weathercode,temperature_2m&timezone=Asia/Bangkok`,
      )
      const weatherData = await weatherResp.json()
      const weatherCode = weatherData.current?.weathercode || 0
      const temperature = weatherData.current?.temperature_2m || 28
      const weather = `${mapWeatherCodeToDescription(weatherCode)}, ${temperature}°C`

      // Determine category based on properties
      const category = getCategoryByElevation(
        place.category.includes("mountain") || place.category.includes("peak") ? 1000 : 
        place.category.includes("beach") || place.category.includes("water") ? 10 : 
        500
      )

      // Generate a random popularity score between 4.0 and 5.0
      const popularity = (4 + Math.random()).toFixed(1)

      return {
        ...place,
        category,
        weather,
        popularity,
        description: `${category} di ${place.location} dengan pemandangan alam yang indah.`,
        image: `https://source.unsplash.com/featured/?bali,${category.toLowerCase().replace(' ', ',')}`,
      }
    } catch (error) {
      console.error("Error enriching place:", error)
      // Return with default values if enrichment fails
      return {
        ...place,
        category: getCategoryByElevation(500),
        weather: "Cerah, 28°C",
        popularity: "4.5",
        description: "Destinasi wisata alam di Bali.",
        image: "https://source.unsplash.com/featured/?bali,nature",
      }
    }
  }

  // Provide mock data in case API fails
  function getMockPlaces(): Place[] {
    return [
      {
        id: "mock-1",
        name: "Pantai Kuta",
        location: "Badung",
        distance: "5.2 km",
        lat: -8.7180,
        lon: 115.1686,
        category: "Perairan",
        weather: "Cerah, 30°C",
        popularity: "4.7",
        image: "https://source.unsplash.com/featured/?kuta,beach",
        description: "Pantai terkenal dengan pemandangan matahari terbenam yang indah dan ombak yang cocok untuk berselancar.",
      },
      {
        id: "mock-2",
        name: "Air Terjun Tegenungan",
        location: "Gianyar",
        distance: "12.8 km",
        lat: -8.5956,
        lon: 115.2882,
        category: "Perairan",
        weather: "Berawan, 28°C",
        popularity: "4.5",
        image: "https://source.unsplash.com/featured/?waterfall,bali",
        description: "Air terjun yang spektakuler dengan kolam alami di bawahnya yang cocok untuk berenang.",
      },
      {
        id: "mock-3",
        name: "Tegalalang Rice Terrace",
        location: "Gianyar",
        distance: "15.3 km",
        lat: -8.4312,
        lon: 115.2767,
        category: "Dataran Tinggi",
        weather: "Cerah, 29°C",
        popularity: "4.8",
        image: "https://source.unsplash.com/featured/?rice,terrace",
        description: "Terasering sawah yang indah dengan pemandangan alam yang menakjubkan.",
      },
    ]
  }

  // Get current places for pagination
  const indexOfLastPlace = currentPage * placesPerPage
  const indexOfFirstPlace = indexOfLastPlace - placesPerPage
  const currentPlaces = places.slice(indexOfFirstPlace, indexOfLastPlace)
  const totalPages = Math.ceil(places.length / placesPerPage)

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (isLoading) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg">Memuat destinasi wisata...</p>
      </div>
    )
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
    )
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="flex items-center text-sm hover:text-emerald-600">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Kembali ke Beranda
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tighter mb-2">Tempat Wisata di Bali</h1>
        <p className="text-muted-foreground">Jelajahi keindahan alam Pulau Dewata</p>
        <p className="text-sm text-muted-foreground mt-2">Menampilkan {places.length} destinasi</p>
      </div>

      <div className="space-y-6">
        {currentPlaces.map((place) => (
          <Card key={place.id} className="overflow-hidden">
            <div className="md:flex">
              <div className="relative h-48 md:h-auto md:w-1/3">
                <Image src={place.image || "/placeholder.svg"} alt={place.name} fill className="object-cover" />
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
        ))}
      </div>

      {/* Pagination */}
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
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {/* page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // tampilin apge 1, page terakir, cuurent page 
                return page === 1 || 
                       page === totalPages || 
                       (page >= currentPage - 1 && page <= currentPage + 1);
              })
              .map((page, index, array) => {
                const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;
                
                return (
                  <React.Fragment key={page}>
                    {showEllipsisBefore && (
                      <PaginationItem>
                        <span className="px-4 py-2">...</span>
                      </PaginationItem>
                    )}
                    <PaginationItem>
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
                    {showEllipsisAfter && (
                      <PaginationItem>
                        <span className="px-4 py-2">...</span>
                      </PaginationItem>
                    )}
                  </React.Fragment>
                );
              })}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) paginate(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

export default DestinationsPage
