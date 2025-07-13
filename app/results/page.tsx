"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Activity, Star, ArrowLeft, Thermometer } from "lucide-react"
import Maps from "@/components/maps";


interface Destination {
  id: string
  name: string
  location: string
  distance: number
  weather: string
  temperature: number
  popularity: number
  activityLevel: string
  image: string
  description: string
  fitness_score?: number
  terrain_type: string
  time_preference: string
  lat: number  // Add latitude
  lon: number  // Add longitude
  category?: string  // Add category for compatibility
}

interface RecommendationResult {
  destinations: Destination[]
  algorithm_info: {
    generations: number
    population_size: number
    mutation_rate: number
    execution_time: number
  }
}

export default function ResultsPage() {
  interface FormData {
    district?: string
    terrainType?: string
    timeOfDay?: string
    activityLevel?: string
  }

  const [formData, setFormData] = useState<FormData | null>(null)
  const [results, setResults] = useState<RecommendationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cachedResult = sessionStorage.getItem("gaResults")
    const cachedAlgorithmInfo = sessionStorage.getItem("gaAlgorithmInfo")
    const storedParams = sessionStorage.getItem("recommendationParams")
    const storedCoordinates = sessionStorage.getItem("userCoordinates")

    if (!storedParams) {
      window.location.href = "/recommendation"
      return
    }

    if (cachedResult && cachedAlgorithmInfo) {
      console.log("💾 Loaded from sessionStorage")
      setResults({
        destinations: JSON.parse(cachedResult),
        algorithm_info: JSON.parse(cachedAlgorithmInfo),
      });
      setFormData(storedParams ? JSON.parse(storedParams) : null)
      setIsLoading(false)
      return
    }

    const fetchResults = async () => {
      try {
        const params = {
          ...JSON.parse(storedParams || '{}'),
          latitude: storedCoordinates ? JSON.parse(storedCoordinates).lat : null,
          longitude: storedCoordinates ? JSON.parse(storedCoordinates).lng : null
        }
        // console.log("📦 Params sent to API:", params)  // Debug: pastikan ini berisi lat/lng user
        setFormData(params)

        const response = await fetch("http://localhost:8000/recommend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("💬 Response from API:", data)

        const fixedResults: RecommendationResult = {
          destinations: data.results.map((d: any) => ({
            id: d.kode,
            name: d.nama,
            location: d.kabupaten,
            distance: d.distance,
            weather: d.weather || "",
            temperature: d.temperature || 0,
            popularity: d.popularity || 0,
            activityLevel: d.tingkat_aktivitas,
            image: d.image,
            description: d.description || "",
            fitness_score: d.fitness_score,
            terrain_type: d.tipe_dataran,
            time_preference: d.time_preference || "",
            lat: d.lat || d.latitude || 0,  // Add latitude mapping
            lon: d.lon || d.longitude || 0, // Add longitude mapping
            category: d.kategori || d.category || d.kabupaten // Add category mapping
          })),
          algorithm_info: data.algorithm_info
        }

        sessionStorage.setItem(
          "gaResults",
          JSON.stringify(fixedResults.destinations)
        );

        sessionStorage.setItem(
          "gaAlgorithmInfo",
          JSON.stringify(fixedResults.algorithm_info)
        );

        setResults(fixedResults)
      } catch (error) {
        console.error("Error fetching recommendations:", error)
        setError("Gagal memuat rekomendasi. Silakan coba lagi.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [])

  const getActivityLevelText = (level: string) => {
    switch (level) {
      case "relaxed":
        return "Santai"
      case "moderate":
        return "Sedang"
      case "extreme":
        return "Ekstrem"
      default:
        return level
    }
  }

  const getTerrainTypeText = (type: string) => {
    switch (type) {
      case "highland":
        return "Dataran Tinggi"
      case "lowland":
        return "Dataran Rendah"
      case "coastal":
        return "Perairan"
      default:
        return type
    }
  }

  const getTimeOfDayText = (time: string) => {
    switch (time) {
      case "morning":
        return "Pagi"
      case "afternoon":
        return "Siang"
      case "evening":
        return "Sore"
      default:
        return time
    }
  }

  if (isLoading) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg">Memproses rekomendasi dengan algoritma genetika...</p>
        <p className="text-sm text-muted-foreground">Mohon tunggu sebentar</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Terjadi Kesalahan</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link href="/recommendation">Kembali ke Pencarian</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!results || !results.destinations || results.destinations.length === 0) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Tidak Ada Hasil</h2>
          <p className="text-muted-foreground mb-6">Tidak ditemukan destinasi yang sesuai dengan preferensi Anda</p>
          <Button asChild>
            <Link href="/recommendation">Coba Pencarian Lain</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <Link href="/recommendation" className="flex items-center text-sm mb-8 hover:text-emerald-600">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Pencarian
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tighter mb-2">Hasil Rekomendasi Wisata</h1>
        <p className="text-muted-foreground">
          Berikut adalah {results.destinations.length} destinasi wisata terbaik yang dipilih menggunakan algoritma
          genetika
        </p>

        {/* Algorithm Info */}
        {results.algorithm_info && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
            <h3 className="font-semibold text-emerald-800 mb-2">Informasi Algoritma Genetika</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-emerald-600">Generasi:</span>
                <div className="font-medium">{results.algorithm_info.generations}</div>
              </div>
              <div>
                <span className="text-emerald-600">Populasi:</span>
                <div className="font-medium">{results.algorithm_info.population_size}</div>
              </div>
              <div>
                <span className="text-emerald-600">Mutasi:</span>
                <div className="font-medium">{(results.algorithm_info.mutation_rate * 100).toFixed(1)}%</div>
              </div>
              <div>
                <span className="text-emerald-600">Waktu:</span>
                <div className="font-medium">{results.algorithm_info.execution_time.toFixed(2)}s</div>
              </div>
            </div>
          </div>
        )}

        {/* User Preferences */}
        {formData && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {formData.district && (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                {formData.district.charAt(0).toUpperCase() + formData.district.slice(1)}
              </span>
            )}
            {formData.terrainType && (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                {getTerrainTypeText(formData.terrainType)}
              </span>
            )}
            {formData.timeOfDay && (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                {getTimeOfDayText(formData.timeOfDay)}
              </span>
            )}
            {formData.activityLevel && (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                {getActivityLevelText(formData.activityLevel)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {results.destinations.map((destination, index) => (
          <Card key={destination.id} className="overflow-hidden">
            <div className="md:flex">
              <div className="relative h-48 md:h-auto md:w-1/3">
                <Image
                  src={destination.image || "/placeholder.svg?height=200&width=400"}
                  alt={destination.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 bg-emerald-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  #{index + 1}
                </div>
                {destination.fitness_score && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Score: {destination.fitness_score.toFixed(2)}
                  </div>
                )}
              </div>
              <CardContent className="p-6 md:w-2/3">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{destination.name}</h2>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>
                        {destination.location} • {destination.distance !== undefined ? destination.distance.toFixed(1) : '-'} km
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm mb-4">{destination.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="flex items-center text-xs bg-muted px-2 py-1 rounded-full">
                    <Thermometer className="h-3 w-3 mr-1" />
                    <span>{destination.weather}, {destination.temperature}°C</span>
                  </div>
                  <div className="flex items-center text-xs bg-muted px-2 py-1 rounded-full">
                    <Activity className="h-3 w-3 mr-1" />
                    <span>{getActivityLevelText(destination.activityLevel)}</span>
                  </div>
                  <div className="flex items-center text-xs bg-muted px-2 py-1 rounded-full">
                    <span>{getTerrainTypeText(destination.terrain_type)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <Link href={`/destinations/${destination.id}?source=results`}>Lihat Detail</Link>
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-8 gap-4">
        <Button variant="outline" asChild>
          <Link href="/recommendation" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ubah Preferensi
          </Link>
        </Button>
        <Button asChild>
          <Link href="/destinations">Jelajahi Semua Destinasi</Link>
        </Button>
      </div>
    </div>
  )
}