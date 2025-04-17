"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageSquare, X, Send, ChevronDown, ChevronUp } from "lucide-react"

type Message = {
  id: number
  text: string
  isUser: boolean
}

// Simple rule-based responses
const getBotResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("halo") || lowerMessage.includes("hai") || lowerMessage.includes("hi")) {
    return "Halo! Saya asisten virtual WisataBali. Ada yang bisa saya bantu tentang wisata di Bali?"
  }

  if (lowerMessage.includes("pantai") || lowerMessage.includes("beach")) {
    return "Bali memiliki banyak pantai indah seperti Kuta, Sanur, Nusa Dua, dan Jimbaran. Pantai mana yang ingin Anda ketahui lebih lanjut?"
  }

  if (lowerMessage.includes("gunung") || lowerMessage.includes("mountain")) {
    return "Gunung Batur dan Gunung Agung adalah dua gunung populer di Bali. Gunung Batur menawarkan pendakian yang lebih mudah dengan pemandangan matahari terbit yang spektakuler."
  }

  if (lowerMessage.includes("air terjun") || lowerMessage.includes("waterfall")) {
    return "Bali memiliki banyak air terjun indah seperti Gitgit, Sekumpul, Tegenungan, dan Aling-Aling. Masing-masing memiliki keunikan tersendiri."
  }

  if (lowerMessage.includes("ubud")) {
    return "Ubud adalah pusat budaya dan seni di Bali. Tempat wisata populer di Ubud termasuk Monkey Forest, Tegalalang Rice Terrace, dan Goa Gajah."
  }

  if (lowerMessage.includes("makanan") || lowerMessage.includes("food") || lowerMessage.includes("kuliner")) {
    return "Makanan khas Bali yang wajib dicoba antara lain Babi Guling, Ayam Betutu, Lawar, dan Sate Lilit. Anda juga bisa mencoba Nasi Campur Bali yang lezat."
  }

  if (lowerMessage.includes("transportasi") || lowerMessage.includes("transport")) {
    return "Untuk transportasi di Bali, Anda bisa menyewa motor, mobil, atau menggunakan layanan transportasi online seperti Gojek atau Grab. Untuk jarak jauh, banyak wisatawan menyewa mobil dengan sopir."
  }

  if (lowerMessage.includes("terima kasih") || lowerMessage.includes("thanks")) {
    return "Sama-sama! Senang bisa membantu. Ada hal lain yang ingin Anda tanyakan?"
  }

  return "Maaf, saya belum memahami pertanyaan Anda. Coba tanyakan tentang pantai, gunung, air terjun, Ubud, makanan, atau transportasi di Bali."
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Halo! Saya asisten virtual WisataBali. Ada yang bisa saya bantu tentang wisata di Bali?",
      isUser: false,
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage = { id: Date.now(), text: input, isUser: true }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate bot thinking
    setTimeout(() => {
      const botResponse = { id: Date.now() + 1, text: getBotResponse(input), isUser: false }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-emerald-600 hover:bg-emerald-700 shadow-lg flex items-center justify-center"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 w-80 md:w-96 shadow-lg flex flex-col transition-all duration-300 ${isMinimized ? "h-14" : "h-[500px]"}`}
    >
      <div
        className="bg-emerald-600 text-white p-3 flex justify-between items-center cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <h3 className="font-bold">Asisten WisataBali</h3>
        <div className="flex items-center space-x-2">
          {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <X
            className="h-4 w-4 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
          />
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="flex flex-col space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${message.isUser ? "bg-gray-200 self-end" : "bg-emerald-100"} rounded-lg p-3 max-w-[80%]`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              ))}
              {isTyping && (
                <div className="bg-emerald-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></div>
                    <div
                      className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-3 border-t flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ketik pertanyaan Anda..."
              className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <Button onClick={handleSendMessage} className="bg-emerald-600 hover:bg-emerald-700 rounded-l-none">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </Card>
  )
}
