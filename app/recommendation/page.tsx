"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Loader2, MapPin, Sun, Compass, Sunrise, Sunset } from "lucide-react"
import {FaUmbrellaBeach} from "react-icons/fa"
import {GiHiking, GiMountaintop} from "react-icons/gi"
import Link from "next/link"

const kabupatenBali = {
  buleleng: { lat: -8.1420, lng: 115.0875 },
  jembrana: { lat: -8.3000, lng: 114.6667 },
  tabanan: { lat: -8.5413, lng: 115.1252 },
  badung: { lat: -8.5167, lng: 115.2000 },
  gianyar: { lat: -8.5333, lng: 115.4000 },
  bangli: { lat: -8.2833, lng: 115.3500 },
  klungkung: { lat: -8.5340, lng: 115.4380 },
  karangasem: { lat: -8.4500, lng: 115.6167 },
  denpasar: { lat: -8.6500, lng: 115.2167 }
};


export default function RecommendationPage() {
  const router = useRouter()
  // const [location, setLocation] = useState("")
  const [isLocating, setIsLocating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({ lat: -8.409518, lng: 115.188919 })
  const [distance, setDistance] = useState(0)

  // Form state
  const [district, setDistrict] = useState("")
  const [terrainType, setTerrainType] = useState("highland")
  const [timeOfDay, setTimeOfDay] = useState("morning")
  const [activityLevel, setActivityLevel] = useState("relaxed")

  useEffect(() => {
    sessionStorage.removeItem("gaResults")
    sessionStorage.removeItem("recommendationParams")
    sessionStorage.removeItem("gaAlgorithmInfo")
  }, [])

  const handleGetLocation = () => {
    setIsLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setCoordinates({ lat, lng })
          // setLocation("Lokasi terdeteksi")
          setIsLocating(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          // setLocation("")
          setIsLocating(false)
        },
      )
    } else {
      alert("Geolocation tidak didukung oleh browser Anda")
      setIsLocating(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Store form data in session storage for the results page
    sessionStorage.setItem(
      "recommendationParams",
      JSON.stringify({
        district,
        terrainType,
        timeOfDay,
        activityLevel,
      }),
    )

    if (coordinates) {
      sessionStorage.setItem("userCoordinates", JSON.stringify(coordinates))
    }

    // Simulate processing time
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/results")
    }, 1500)
  }

  useEffect(() => {
    const toRad = (value: number) => (value * Math.PI) / 180;

    const tikpus = kabupatenBali[district as keyof typeof kabupatenBali] || { lat: -8.409518, lng: 115.188919 }

  const R = 6371; // Radius bumi dalam kilometer
  const dLat = toRad(tikpus.lat - coordinates.lat);
  const dLon = toRad(tikpus.lng - coordinates.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coordinates.lat)) *
      Math.cos(toRad(tikpus.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  setDistance(R * c);

  }, [coordinates, district])

  return (
    <div className="min-h-screen bg-[#f8f5f2] relative overflow-hidden">
    {/* Decorative Elements */}
    <div className="absolute top-10 right-10 w-64 h-64 -translate-y-1/4 translate-x-1/4">
      <div className="w-full h-full rounded-full bg-[#f9c06a] opacity-20"></div>
    </div>
    <div className="absolute bottom-10 right-10 w-64 h-64 -translate-y-1/4 translate-x-1/4">
      <div className="w-full h-full rounded-full bg-[#f9c06a] opacity-20"></div>
    </div>
    <div className="absolute bottom-10 left-10 w-80 h-80 translate-y-1/3 -translate-x-1/3">
      <div className="w-full h-full rounded-full bg-[#4dab9a] opacity-10"></div>
    </div>
    <div className="absolute top-0 left-80 w-80 h-80 translate-y-1/3 -translate-x-1/3">
      <div className="w-full h-full rounded-full bg-[#4dab9a] opacity-10"></div>
    </div>
    <div className="absolute top-48 right-48 w-64 h-64 translate-y-1/3 -translate-x-1/3">
      <div className="w-full h-full rounded-full bg-[#f43f5e] opacity-10"></div>
    </div>

    {/* Dekorasi INCOMING */}
    


    <div className="container py-12 max-w-4xl mx-auto relative z-10">
        <Link href="/" className="flex items-center text-sm mb-8 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Beranda
        </Link>

      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-gray-800">Temukan Wisata Impianmu</h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          Isi preferensi wisata Anda untuk mendapatkan rekomendasi destinasi terbaik yang sesuai dengan keinginan Anda
        </p>
      </div>

      <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm">
      <div className="bg-gradient-to-r from-emerald-600/90 to-teal-500/90 p-6 text-white">
            <h2 className="text-xl font-semibold flex items-center">
              <Compass className="mr-2 h-5 w-5" />
              Preferensi Perjalanan
            </h2>
            <p className="text-white/80 text-sm mt-1">
              Bantu kami menemukan destinasi yang paling sesuai dengan preferensi Anda
            </p>
          </div>
        <CardContent className="pt-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 ">
              <div className="space-y-2">
                <Label>Lokasi Anda</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                  >
                    <MapPin className="mr-1 h-4 w-4" />
                    {isLocating ? 'Mencari lokasi...' : 'Deteksi lokasi Otomatis'}
                  </Button>
                  
                  {coordinates ? (
                    <span className="py-2 px-3 border rounded-md flex-1 
                    bg-gradient-to-r from-amber-400/70 to-orange-500/70  text-center">
                      Jarak ke {district || "titik pusat"}: {Math.ceil(distance)} km
                    </span>
                  ) : (
                    <span className="py-2 px-3 border rounded-md flex-1 
                    bg-gradient-to-l from-red-400/40 to-rose-500/70 text-center ">
                      Lokasi tidak terdeteksi
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district" className="text-gray-700 font-medium">
                  Kabupaten Tujuan
                  </Label>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger id="district"
                    className="border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <SelectValue placeholder="Pilih kabupaten" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="badung">Badung</SelectItem>
                    <SelectItem value="denpasar">Denpasar</SelectItem>
                    <SelectItem value="gianyar">Gianyar</SelectItem>
                    <SelectItem value="tabanan">Tabanan</SelectItem>
                    <SelectItem value="karangasem">Karangasem</SelectItem>
                    <SelectItem value="buleleng">Buleleng</SelectItem>
                    <SelectItem value="jembrana">Jembrana</SelectItem>
                    <SelectItem value="bangli">Bangli</SelectItem>
                    <SelectItem value="klungkung">Klungkung</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipe Wisata Alam</Label>
                <RadioGroup
                  value={terrainType}
                  onValueChange={setTerrainType}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <Label
                    htmlFor="highland"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-emerald-200 transition-all [&:has([data-state=checked])]:border-emerald-500 [&:has([data-state=checked])]:bg-emerald-50"
                  >
                    <RadioGroupItem value="highland" id="highland" className="sr-only" />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-3 h-6 w-6"
                    >
                      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                    </svg>
                    <div className="text-center">
                      <span className="block font-medium">Dataran Tinggi</span>
                      <span className="block text-xs text-muted-foreground">Pegunungan, Bukit</span>
                    </div>
                  </Label>
                  <Label
                    htmlFor="lowland"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-emerald-200 transition-all [&:has([data-state=checked])]:border-emerald-500 [&:has([data-state=checked])]:bg-emerald-50"
                  >
                    <RadioGroupItem value="lowland" id="lowland" className="sr-only" />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-3 h-6 w-6"
                    >
                      <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
                    </svg>
                    <div className="text-center">
                      <span className="block font-medium">Dataran Rendah</span>
                      <span className="block text-xs text-muted-foreground">Hutan, Taman, Kebun</span>
                    </div>
                  </Label>
                  <Label
                    htmlFor="water"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-emerald-200 transition-all [&:has([data-state=checked])]:border-emerald-500 [&:has([data-state=checked])]:bg-emerald-50"
                  >
                    <RadioGroupItem value="water" id="water" className="sr-only" />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-3 h-6 w-6"
                    >
                      <path d="M2 12h20" />
                      <path d="M5 12v4c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4" />
                      <path d="m2 12 3-4c.9-1.1 2.5-1.1 3.4 0L12 12" />
                      <path d="m13 12 3.6-4c.9-1.1 2.5-1.1 3.4 0l2 2.7" />
                    </svg>
                    <div className="text-center">
                      <span className="block font-medium">Perairan</span>
                      <span className="block text-xs text-muted-foreground">Air Terjun, Danau, Pantai</span>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Waktu Berlibur</Label>
                <RadioGroup
                  value={timeOfDay}
                  onValueChange={setTimeOfDay}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <Label
                    htmlFor="morning"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-emerald-200 transition-all [&:has([data-state=checked])]:border-emerald-500 [&:has([data-state=checked])]:bg-emerald-50"
                  >
                    <RadioGroupItem value="morning" id="morning" className="sr-only" />
                    <Sunrise className="mb-3 h-6 w-6" />
                    <span className="block font-medium">Pagi</span>
                  </Label>
                  <Label
                    htmlFor="afternoon"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-emerald-200 transition-all [&:has([data-state=checked])]:border-emerald-500 [&:has([data-state=checked])]:bg-emerald-50"
                  >
                    <RadioGroupItem value="afternoon" id="afternoon" className="sr-only" />
                    <Sun className="mb-3 h-6 w-6" />
                    <span className="block font-medium">Siang</span>
                  </Label>
                  <Label
                    htmlFor="evening"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-emerald-200 transition-all [&:has([data-state=checked])]:border-emerald-500 [&:has([data-state=checked])]:bg-emerald-50"
                  >
                    <RadioGroupItem value="evening" id="evening" className="sr-only" />
                    <Sunset className="mb-3 h-6 w-6" />
                    <span className="block font-medium">Sore</span>
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Tingkat Aktivitas Fisik</Label>
                <RadioGroup
                  value={activityLevel}
                  onValueChange={setActivityLevel}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <Label
                    htmlFor="relaxed"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-emerald-200 transition-all [&:has([data-state=checked])]:border-emerald-500 [&:has([data-state=checked])]:bg-emerald-50"
                  >
                    <RadioGroupItem value="relaxed" id="relaxed" className="sr-only" />
                    <FaUmbrellaBeach className="mb-3 h-6 w-6" />
                    <span className="block font-medium">Santai</span>
                    <span className="block text-xs text-muted-foreground text-center">Cocok untuk yang ingin menikmati alam tanpa banyak bergerak</span>
                  </Label>
                  <Label
                    htmlFor="moderate"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-emerald-200 transition-all [&:has([data-state=checked])]:border-emerald-500 [&:has([data-state=checked])]:bg-emerald-50"
                  >
                    <RadioGroupItem value="moderate" id="moderate" className="sr-only" />
                    <GiHiking className="mb-3 h-6 w-6" />
                    <span className="block font-medium">Sedang</span>
                    <span className="block text-xs text-muted-foreground text-center mt-1">Butuh sedikit tenaga tapi tetap nyaman. Cocok buat keluarga muda atau traveler biasa.</span>
                  </Label>
                  <Label
                    htmlFor="extreme"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-emerald-200 transition-all [&:has([data-state=checked])]:border-emerald-500 [&:has([data-state=checked])]:bg-emerald-50"
                  >
                    <RadioGroupItem value="extreme" id="extreme" className="sr-only" />
                    <GiMountaintop className="mb-3 h-6 w-6" />
                    <span className="block font-medium">Ekstrem</span>
                    <span className="block text-xs text-muted-foreground text-center mt-1">Butuh stamina dan kesiapan fisik. Biasanya untuk pecinta petualangan.</span>
                  </Label>
                </RadioGroup>
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Cari Rekomendasi Wisata"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}
