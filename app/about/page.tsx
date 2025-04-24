"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

// Tipe data untuk anggota tim
type TeamMember = {
  id: number
  name: string
  role: string
  bio: string
  imageUrl: string
}

// Data anggota tim
const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "King Gustos",
    role: "Ketua Tim",
    bio: "Budi adalah ketua tim yang bertanggung jawab untuk koordinasi proyek. Dia memiliki pengalaman dalam pengembangan web dan manajemen proyek.",
    imageUrl: "/images/King-profile.png?height=300&width=300&text=Gustos",
  },
  {
    id: 2,
    name: "Bintang BoB",
    role: "UI/UX Designer",
    bio: "Ani adalah desainer UI/UX yang bertanggung jawab untuk tampilan dan pengalaman pengguna. Dia memiliki keahlian dalam desain grafis dan interaksi pengguna.",
    imageUrl: "/images/bob-profile.png?height=300&width=300&text=BoB",
  },
  {
    id: 3,
    name: "Santos",
    role: "Frontend Developer",
    bio: "Citra adalah pengembang frontend yang bertanggung jawab untuk implementasi antarmuka pengguna. Dia ahli dalam HTML, CSS, dan JavaScript.",
    imageUrl: "/images/sans-profile.png?height=300&width=300&text=Citra",
  },
  {
    id: 4,
    name: "Dwikszu",
    role: "Backend Developer",
    bio: "Dodi adalah pengembang backend yang bertanggung jawab untuk logika server dan database. Dia memiliki keahlian dalam Node.js dan database.",
    imageUrl: "/images/dwikz-profile.png?height=300&width=300&text=Dodi",
  },
  {
    id: 5,
    name: "Adittt",
    role: "G.O.A.T",
    bio: "Eka adalah penulis konten yang bertanggung jawab untuk semua teks dan konten di website. Dia memiliki latar belakang dalam jurnalisme dan komunikasi.",
    imageUrl: "/images/aditt-profile.png?height=300&width=300&text=Eka",
  },
]

export default function AboutPage() {
  // State untuk menyimpan anggota tim yang dipilih dan status popup
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  // Fungsi untuk menampilkan popup dengan detail anggota
  const showMemberDetails = (member: TeamMember) => {
    setSelectedMember(member)
    setIsPopupOpen(true)
  }

  // Fungsi untuk menutup popup
  const closePopup = () => {
    setIsPopupOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">WisataBali</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link href="/" className="text-sm font-medium transition-colors hover:text-emerald-600">
                Beranda
              </Link>
              <Link href="/about" className="text-sm font-medium transition-colors text-emerald-600">
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

      <div className="container py-12">
        {/* Judul Halaman */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Tentang Kami</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tim WisataBali adalah kelompok mahasiswa yang berdedikasi untuk membantu wisatawan menemukan destinasi
            terbaik di Bali.
          </p>
        </div>

        {/* Kartu Anggota Tim - dengan grid yang dimodifikasi */}
        <div className="flex flex-wrap justify-center max-w-5xl mx-auto">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] m-2"
              onClick={() => showMemberDetails(member)}
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer h-full">
                <div className="relative h-64 w-full">
                  <Image src={member.imageUrl || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-emerald-600">{member.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Popup Detail Anggota */}
        {isPopupOpen && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative animate-fadeIn">
              {/* Tombol X yang lebih jelas */}
              <button
                onClick={closePopup}
                className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center z-10"
                aria-label="Tutup"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <div className="relative h-64 w-full">
                <Image
                  src={selectedMember.imageUrl || "/placeholder.svg"}
                  alt={selectedMember.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold mb-1">{selectedMember.name}</h3>
                <p className="text-emerald-600 mb-4">{selectedMember.role}</p>
                <p className="text-gray-600">{selectedMember.bio}</p>

                {/* Tombol Tutup tambahan di bagian bawah */}
                <button
                  onClick={closePopup}
                  className="mt-6 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
