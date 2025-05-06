"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Activity, Star, ArrowLeft, Share2, Heart, CloudSun } from "lucide-react"

// Static data untuk demo
const mockResults = [
  {
    id: 1,
    name: "Pantai Kuta",
    location: "Badung",
    distance: "5.2 km",
    weather: "Cerah, 30°C",
    popularity: 4.7,
    activityLevel: "Sedang",
    image: "/placeholder.svg?height=200&width=400&text=Pantai%20Kuta",
    description:
      "Pantai Kuta adalah salah satu pantai paling terkenal di Bali, terkenal dengan pemandangan matahari terbenamnya yang indah dan ombak yang cocok untuk berselancar.",
  },
  {
    id: 2,
    name: "Air Terjun Tegenungan",
    location: "Gianyar",
    distance: "12.8 km",
    weather: "Berawan, 28°C",
    popularity: 4.5,
    activityLevel: "Sedang",
    image: "/placeholder.svg?height=200&width=400&text=Air%20Terjun%20Tegenungan",
    description:
      "Air Terjun Tegenungan menawarkan pemandangan air terjun yang spektakuler dengan kolam alami di bawahnya yang cocok untuk berenang.",
  },
  {
    id: 3,
    name: "Tegalalang Rice Terrace",
    location: "Gianyar",
    distance: "18.5 km",
    weather: "Cerah, 29°C",
    popularity: 4.8,
    activityLevel: "Santai",
    image: "/placeholder.svg?height=200&width=400&text=Tegalalang%20Rice%20Terrace",
    description:
      "Tegalalang Rice Terrace adalah sawah bertingkat yang indah dengan sistem irigasi tradisional Bali yang dikenal sebagai subak.",
  },
  {
    id: 4,
    name: "Pantai Nusa Dua",
    location: "Badung",
    distance: "15.3 km",
    weather: "Cerah, 31°C",
    popularity: 4.6,
    activityLevel: "Santai",
    image: "/placeholder.svg?height=200&width=400&text=Pantai%20Nusa%20Dua",
    description:
      "Pantai Nusa Dua terkenal dengan pasir putihnya yang bersih dan perairan yang tenang, cocok untuk berenang dan snorkeling.",
  },
  {
    id: 5,
    name: "Gunung Batur",
    location: "Bangli",
    distance: "42.7 km",
    weather: "Berawan, 24°C",
    popularity: 4.9,
    activityLevel: "Ekstrem",
    image: "/placeholder.svg?height=200&width=400&text=Gunung%20Batur",
    description:
      "Gunung Batur adalah gunung berapi aktif yang menawarkan pendakian menarik dengan pemandangan matahari terbit yang spektakuler.",
  },
]

export default function ResultsPage() {
  interface FormData {
    district?: string
    terrainType?: string
    timeOfDay?: string
    activityLevel?: string
  }

  const [formData, setFormData] = useState<FormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Ambil data dari session storage
    const storedParams = sessionStorage.getItem("recommendationParams")
    if (storedParams) {
      setFormData(JSON.parse(storedParams))
    }

    // Anggep ja loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg">Memuat hasil rekomendasi...</p>
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
          Berikut adalah 5 destinasi wisata terbaik yang sesuai dengan preferensi Anda
        </p>
        {formData && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {formData.district && (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                {formData.district.charAt(0).toUpperCase() + formData.district.slice(1)}
              </span>
            )}
            {formData.terrainType && (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                {formData.terrainType === "highland"
                  ? "Dataran Tinggi"
                  : formData.terrainType === "lowland"
                    ? "Dataran Rendah"
                    : "Perairan"}
              </span>
            )}
            {formData.timeOfDay && (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                {formData.timeOfDay === "morning" ? "Pagi" : formData.timeOfDay === "afternoon" ? "Siang" : "Sore"}
              </span>
            )}
            {formData.activityLevel && (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                {formData.activityLevel === "relaxed"
                  ? "Santai"
                  : formData.activityLevel === "moderate"
                    ? "Sedang"
                    : "Ekstrem"}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {mockResults.map((result) => (
          <Card key={result.id} className="overflow-hidden">
            <div className="md:flex">
              <div className="relative h-48 md:h-auto md:w-1/3">
                <Image src={result.image || "/placeholder.svg"} alt={result.name} fill className="object-cover" />
              </div>
              <CardContent className="p-6 md:w-2/3">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{result.name}</h2>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>
                        {result.location} • {result.distance}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400 mr-1" />
                    <span className="font-medium">{result.popularity}</span>
                  </div>
                </div>

                <p className="text-sm mb-4">{result.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="flex items-center text-xs bg-muted px-2 py-1 rounded-full">
                    <CloudSun className="h-3 w-3 mr-1" />
                    <span>{result.weather}</span>
                  </div>
                  <div className="flex items-center text-xs bg-muted px-2 py-1 rounded-full">
                    <Activity className="h-3 w-3 mr-1" />
                    <span>{result.activityLevel}</span>
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
  )
}
