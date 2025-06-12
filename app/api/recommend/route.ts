import { NextResponse } from "next/server"

// FastAPI endpoint
const FASTAPI_URL = "http://localhost:8000"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    console.log("Sending data to FastAPI:", data)

    // Send request to FastAPI backend
    const response = await fetch(`${FASTAPI_URL}/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`FastAPI responded with status: ${response.status}`)
    }

    const results = await response.json()

    console.log("Received results from FastAPI:", results)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error calling FastAPI:", error)

    // Fallback to mock data if FastAPI is not available
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
    ]

    return NextResponse.json({ results: mockResults })
  }
}
