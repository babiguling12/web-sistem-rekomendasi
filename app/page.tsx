import Link from "next/link"
import Image from "next/image"
import { ArrowRight, MapPin, Sun, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 text-emerald-600" />
              <span className="font-bold text-xl">WisataBali</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-8">
              <Link href="/about" className="text-sm font-medium transition-colors hover:text-emerald-600">
                Tentang
              </Link>
              <Link href="/destinations" className="text-sm font-medium transition-colors hover:text-emerald-600">
                Destinasi
              </Link>
              <Link href="/contact" className="text-sm font-medium transition-colors hover:text-emerald-600">
                Kontak
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/bali-landing.jpg"
              alt="Pemandangan Bali"
              fill
              className="object-cover brightness-80"
              priority
            />
          </div>
          <div className="container relative z-10 py-24 md:py-32 lg:py-40">
            <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight drop-shadow-md">
                Temukan Destinasi Wisata Alam Bali yang Sesuai Untukmu
              </h1>
              <p className="text-lg text-white md:text-xl text-muted-foreground max-w-[700px]">
                Sistem rekomendasi cerdas yang membantu menemukan tempat wisata alam di Pulau Bali berdasarkan
                preferensi dan kondisi terkini.
              </p>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/recommendation">Mulai Pencarian</Link> <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter mb-4">Bagaimana Sistem Ini Bekerja</h2>
            <p className="text-muted-foreground max-w-[700px] mx-auto">
              Sistem rekomendasi kami menggunakan algoritma genetika untuk memberikan saran destinasi wisata yang paling
              sesuai dengan preferensi Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 border rounded-lg bg-card">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Deteksi Lokasi</h3>
              <p className="text-muted-foreground">
                Sistem mendeteksi lokasi Anda secara otomatis atau Anda dapat memilih lokasi secara manual.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 border rounded-lg bg-card">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <Sun className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Analisis Cuaca</h3>
              <p className="text-muted-foreground">
                Kami menganalisis kondisi cuaca terkini untuk memastikan pengalaman wisata yang optimal.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 border rounded-lg bg-card">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Algoritma Genetika</h3>
              <p className="text-muted-foreground">
                Rekomendasi disesuaikan dengan preferensi Anda menggunakan algoritma genetika yang canggih.
              </p>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="bg-emerald-50 py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter mb-4">Proses Rekomendasi</h2>
              <p className="text-muted-foreground max-w-[700px] mx-auto">
                Sistem kami menggunakan algoritma genetika untuk memberikan rekomendasi yang paling sesuai dengan
                preferensi Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <ol className="relative border-l border-emerald-600 ml-3">
                  {[
                    {
                      title: "Pengumpulan Data",
                      description:
                        "Sistem mengumpulkan data dari berbagai sumber termasuk Google API untuk rating dan ulasan.",
                    },
                    {
                      title: "Pemrosesan Preferensi",
                      description:
                        "Preferensi pengguna dianalisis dan diubah menjadi parameter untuk algoritma genetika.",
                    },
                    {
                      title: "Algoritma Genetika",
                      description: "Algoritma genetika memproses data untuk menemukan kombinasi destinasi terbaik.",
                    },
                    {
                      title: "Penyajian Hasil",
                      description:
                        "Hasil rekomendasi ditampilkan kepada pengguna berdasarkan kesesuaian dengan preferensi.",
                    },
                  ].map((step, index) => (
                    <li key={index} className="mb-10 ml-6">
                      <span className="absolute flex items-center justify-center w-8 h-8 bg-emerald-600 rounded-full -left-4 text-white">
                        {index + 1}
                      </span>
                      <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="relative h-80 md:h-96">
              <video
                src="/images/ai_tr.webm"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
              />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <h2 className="text-3xl font-bold tracking-tighter mb-4">Siap Menemukan Destinasi Wisata Impianmu?</h2>
              <p className="text-muted-foreground mb-6">
                Cukup isi preferensi wisata Anda, dan sistem kami akan merekomendasikan destinasi terbaik untuk Anda.
              </p>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/recommendation">Cari Rekomendasi Wisata</Link>
              </Button>
            </div>
            <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden">
              <Image
                src="/images/icon-wisata.webp"
                alt="Destinasi Wisata Bali"
                fill
                className="object-center object-contain scale-110"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <span className="font-bold">WisataBali</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                Sistem Rekomendasi Destinasi Wisata Alam di Pulau Bali Berbasis Web Menggunakan Algoritma Genetika
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">Navigasi</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-muted-foreground hover:text-emerald-600">
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-emerald-600">
                    Tentang
                  </Link>
                </li>
                <li>
                  <Link href="/destinations" className="text-muted-foreground hover:text-emerald-600">
                    Destinasi
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-emerald-600">
                    Kontak
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Kategori Wisata</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/category/mountain" className="text-muted-foreground hover:text-emerald-600">
                    Dataran Tinggi
                  </Link>
                </li>
                <li>
                  <Link href="/category/beach" className="text-muted-foreground hover:text-emerald-600">
                    Dataran Rendah
                  </Link>
                </li>
                <li>
                  <Link href="/category/waterfall" className="text-muted-foreground hover:text-emerald-600">
                    Perairan
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Kontak</h3>
              <ul className="space-y-2 text-sm">
                <li className="text-muted-foreground">Email: payumelali@gmail.com</li>
                <li className="text-muted-foreground">Telepon: +62 123 4567 8910</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} WisataBali. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
