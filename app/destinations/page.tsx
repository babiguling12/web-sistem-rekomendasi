'use client'

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Star, CloudSun, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"

const FOURSQUARE_KEY = 'fsq3fuXG1UpBrEPokg1hPjcotnEi1/1GNAzRBPRc7jqsJCk='

type Destination = {
  id: number
  name: string
  latitude: number
  longitude: number
  location: string
  image?: string
  distance_km?: number
  category?: string
  weather?: string
  popularity?: number
  description?: string
}

export default function ResultsPage() {
  const [results, setResults] = useState<Destination[]>([])
  const [images, setImages] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const preferences = sessionStorage.getItem("userCoordinates")
    if (!preferences) return

    const fetchResults = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/recommend/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: preferences,
        })
        const data = await response.json()
        setResults(data.destinations)

        const imageMap: Record<number, string> = {}
        await Promise.all(
          data.destinations.map(async (dest: Destination) => {
            const img = await fetchFoursquareImage(dest.name, dest.latitude, dest.longitude)
            if (img) imageMap[dest.id] = img
          })
        )
        setImages(imageMap)
      } catch (error) {
        console.error("Failed to fetch recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [])

  async function fetchFoursquareImage(name: string, lat: number, lon: number): Promise<string | null> {
    try {
      const searchUrl = `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(name)}&ll=${lat},${lon}&limit=1`
      const searchRes = await fetch(searchUrl, {
        headers: { Authorization: FOURSQUARE_KEY },
      })
      const searchData = await searchRes.json()
      const place = searchData.results?.[0]
      if (!place) return null

      const photoUrl = `https://api.foursquare.com/v3/places/${place.fsq_id}/photos`
      const photoRes = await fetch(photoUrl, {
        headers: { Authorization: FOURSQUARE_KEY },
      })
      const photos = await photoRes.json()
      if (photos.length > 0) {
        const { prefix, suffix } = photos[0]
        return `${prefix}original${suffix}`
      }
      return null
    } catch (err) {
      console.warn("Foursquare error:", err)
      return null
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Hasil Rekomendasi Wisata</h1>

      {results.length === 0 ? (
        <p className="text-center text-muted-foreground">Tidak ada destinasi yang ditemukan.</p>
      ) : (
        <div className="space-y-6">
          {results.map((destination) => (
            <Card key={destination.id} className="overflow-hidden">
              <div className="md:flex">
                <div className="relative h-48 md:h-auto md:w-1/3">
                  <Image
                    src={images[destination.id] || destination.image || "/placeholder.svg?height=200&width=400"}
                    alt={destination.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6 md:w-2/3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold mb-1">{destination.name}</h2>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{destination.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400 mr-1" />
                      <span className="font-medium">{destination.popularity?.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-sm mb-4">{destination.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center text-xs bg-muted px-2 py-1 rounded-full">
                      <CloudSun className="h-3 w-3 mr-1" />
                      <span>{destination.weather}</span>
                    </div>
                    <div className="flex items-center text-xs bg-muted px-2 py-1 rounded-full">
                      <Activity className="h-3 w-3 mr-1" />
                      <span>{destination.category}</span>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
