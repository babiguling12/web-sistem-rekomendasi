"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Clock, Activity, ArrowLeft, Loader2, MapPin } from "lucide-react"
import Link from "next/link"


export default function RecommendationPage() {
  const router = useRouter()
  // const [location, setLocation] = useState("")
  const [isLocating, setIsLocating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)

  // Form state
  const [district, setDistrict] = useState("")
  const [terrainType, setTerrainType] = useState("highland")
  const [timeOfDay, setTimeOfDay] = useState("morning")
  const [activityLevel, setActivityLevel] = useState("relaxed")

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

    // Simulate processing time
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/results")
    }, 1500)
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <Link href="/" className="flex items-center text-sm mb-8 hover:text-emerald-600">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Beranda
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tighter mb-2">Cari Rekomendasi Wisata</h1>
        <p className="text-muted-foreground">
          Isi preferensi wisata Anda untuk mendapatkan rekomendasi destinasi terbaik
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                    <span className="py-2 px-3 border rounded-md flex-1 bg-muted/50 text-center">
                      Lat: {coordinates.lat}, Lng: {coordinates.lng}
                    </span>
                  ) : (
                    <span className="py-2 px-3 border rounded-md flex-1 bg-muted/50 text-center">
                      Lokasi tidak terdeteksi
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">Kabupaten Tujuan</Label>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger id="district">
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
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-emerald-600"
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
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-emerald-600"
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
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-emerald-600"
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
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-emerald-600"
                  >
                    <RadioGroupItem value="morning" id="morning" className="sr-only" />
                    <Clock className="mb-3 h-6 w-6" />
                    <span className="block font-medium">Pagi</span>
                  </Label>
                  <Label
                    htmlFor="afternoon"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-emerald-600"
                  >
                    <RadioGroupItem value="afternoon" id="afternoon" className="sr-only" />
                    <Clock className="mb-3 h-6 w-6" />
                    <span className="block font-medium">Siang</span>
                  </Label>
                  <Label
                    htmlFor="evening"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-emerald-600"
                  >
                    <RadioGroupItem value="evening" id="evening" className="sr-only" />
                    <Clock className="mb-3 h-6 w-6" />
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
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-emerald-600"
                  >
                    <RadioGroupItem value="relaxed" id="relaxed" className="sr-only" />
                    <Activity className="mb-3 h-6 w-6" />
                    <span className="block font-medium">Santai</span>
                    <span className="block text-xs text-muted-foreground text-center">Cocok untuk yang ingin menikmati alam tanpa banyak bergerak</span>
                  </Label>
                  <Label
                    htmlFor="moderate"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-emerald-600"
                  >
                    <RadioGroupItem value="moderate" id="moderate" className="sr-only" />
                    <Activity className="mb-3 h-6 w-6" />
                    <span className="block font-medium">Sedang</span>
                    <span className="block text-xs text-muted-foreground text-center mt-1">Butuh sedikit tenaga tapi tetap nyaman. Cocok buat keluarga muda atau traveler biasa.</span>
                  </Label>
                  <Label
                    htmlFor="extreme"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-emerald-600"
                  >
                    <RadioGroupItem value="extreme" id="extreme" className="sr-only" />
                    <Activity className="mb-3 h-6 w-6" />
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
  )
}
