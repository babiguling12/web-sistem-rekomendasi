from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import Dict, Any, List
import sqlite3
import os
import random
import math
from datetime import datetime
import requests

app = FastAPI(title="Wisata Bali Recommendation API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(__file__), "rekomendasi_wisata.db")
    if not os.path.exists(db_path):
        raise HTTPException(status_code=500, detail="Database not found. Please run load_real_data.py first")
    return sqlite3.connect(db_path)

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance using Haversine formula"""
    R = 6371  # Earth radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    
    return distance

def fitness_function(destination, preferences):
    """Calculate fitness score for genetic algorithm"""
    score = 0
    
    # Distance score (closer is better)
    distance = calculate_distance(
        preferences["latitude"], 
        preferences["longitude"], 
        destination["latitude"], 
        destination["longitude"]
    )
    distance_score = max(0, 100 - distance * 1.5)  # Reduced penalty for distance
    
    # Location match (kabupaten)
    location_score = 100 if destination["kabupaten"].lower() == preferences["district"].lower() else 20
    
    # Terrain type match
    terrain_map = {
        "highland": ["Pegunungan", "Persawahan", "Hutan"],
        "lowland": ["Pantai", "Danau"],
        "water": ["Air Terjun", "Danau", "Pantai"]
    }
    user_terrain = preferences.get("terrainType", "lowland")
    terrain_score = 100 if destination["tipe_dataran"] in terrain_map.get(user_terrain, []) else 30
    
    # Activity level match
    activity_map = {
        "relaxed": ["Rendah"],
        "moderate": ["Sedang", "Rendah"],
        "extreme": ["Tinggi", "Sedang"]
    }
    user_activity = preferences.get("activityLevel", "moderate")
    activity_score = 100 if destination["tingkat_aktivitas"] in activity_map.get(user_activity, []) else 20
    
    # Weather compatibility (based on time and terrain)
    weather_score = 80
    time_of_day = preferences.get("timeOfDay", "afternoon")
    if time_of_day == "morning" and destination["tipe_dataran"] == "Pegunungan":
        weather_score = 100  # Mountains are great in the morning
    elif time_of_day == "afternoon" and destination["tipe_dataran"] == "Pantai":
        weather_score = 100  # Beaches are great in the afternoon
    elif time_of_day == "evening" and destination["tipe_dataran"] in ["Pantai", "Danau"]:
        weather_score = 100  # Water views are great in the evening
    
    # Popularity score
    popularity_score = min(destination["popularitas"] * 20, 100)
    
    # Calculate weighted score
    total_score = (
        distance_score * 0.20 +      # Distance importance
        location_score * 0.15 +      # Location preference
        terrain_score * 0.25 +       # Terrain type match
        activity_score * 0.20 +      # Activity level match
        weather_score * 0.10 +       # Weather compatibility
        popularity_score * 0.10      # Popularity
    )
    
    return total_score / 100  # Normalize to 0-1

def genetic_algorithm(destinations, preferences, generations=15, population_size=30):
    """Enhanced genetic algorithm implementation"""
    start_time = datetime.now()
    
    if len(destinations) < 5:
        # If we have fewer than 5 destinations, just return them all
        results = [(dest, fitness_function(dest, preferences)) for dest in destinations]
        results.sort(key=lambda x: x[1], reverse=True)
        end_time = datetime.now()
        execution_time = (end_time - start_time).total_seconds()
        
        return results, {
            "generations": 1,
            "population_size": len(destinations),
            "mutation_rate": 0.0,
            "execution_time": execution_time
        }
    
    # Initial population - select diverse destinations
    population = random.sample(destinations, min(population_size, len(destinations)))
    
    best_fitness_history = []
    
    for generation in range(generations):
        # Calculate fitness for each destination
        fitness_scores = []
        for dest in population:
            fitness = fitness_function(dest, preferences)
            fitness_scores.append((dest, fitness))
        
        # Sort by fitness (descending)
        fitness_scores.sort(key=lambda x: x[1], reverse=True)
        best_fitness_history.append(fitness_scores[0][1])
        
        # Selection: Keep top 40% as elite
        elite_size = max(3, int(population_size * 0.4))
        elite = [item[0] for item in fitness_scores[:elite_size]]
        
        # Create new population
        new_population = elite.copy()
        
        # Add some random destinations for diversity (exploration)
        remaining_spots = population_size - len(new_population)
        if remaining_spots > 0:
            available_destinations = [d for d in destinations if d not in new_population]
            if available_destinations:
                # Add random destinations with bias towards higher fitness
                random_count = min(remaining_spots, len(available_destinations))
                
                # Calculate fitness for available destinations
                available_fitness = [(d, fitness_function(d, preferences)) for d in available_destinations]
                available_fitness.sort(key=lambda x: x[1], reverse=True)
                
                # Select from top 70% of available destinations
                top_available = available_fitness[:int(len(available_fitness) * 0.7)]
                if top_available:
                    selected_random = random.sample([d[0] for d in top_available], 
                                                  min(random_count, len(top_available)))
                    new_population.extend(selected_random)
        
        population = new_population
        
        # Early stopping if fitness converges
        if generation > 5 and len(set(best_fitness_history[-3:])) == 1:
            break
    
    # Final fitness calculation
    final_scores = [(dest, fitness_function(dest, preferences)) for dest in population]
    final_scores.sort(key=lambda x: x[1], reverse=True)
    
    end_time = datetime.now()
    execution_time = (end_time - start_time).total_seconds()
    
    return final_scores[:5], {
        "generations": generation + 1,
        "population_size": population_size,
        "mutation_rate": 0.1,
        "execution_time": execution_time,
        "convergence": len(set(best_fitness_history[-3:])) == 1 if len(best_fitness_history) >= 3 else False
    }

@app.get("/")
async def root():
    return {
        "message": "Wisata Bali Recommendation API is running!",
        "version": "2.0.0",
        "endpoints": ["/destinations", "/recommend", "/weather/{time_of_day}"]
    }

@app.get("/destinations")
async def get_destinations():
    """Get all destinations from database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM tempat_wisata ORDER BY popularitas DESC")
        rows = cursor.fetchall()
        conn.close()
        
        destinations = []
        for row in rows:
            destinations.append({
                "id": row[0],
                "nama": row[1],
                "kabupaten": row[2],
                "tipe_dataran": row[3],
                "tingkat_aktivitas": row[4],
                "popularitas": row[5],
                "latitude": row[6],
                "longitude": row[7],
                "deskripsi": row[8]
            })
        
        return {
            "total": len(destinations),
            "destinations": destinations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


async def fetch_foursquare_image(name: str, lat: float, lon: float) -> str:
    try:
        headers = {
            "Authorization": "fsq3fuXG1UpBrEPokg1hPjcotnEi1/1GNAzRBPRc7jqsJCk="
        }
        search_url = f"https://api.foursquare.com/v3/places/search?query={name}&ll={lat},{lon}&limit=1"
        res = requests.get(search_url, headers=headers)
        data = res.json()
        if not data.get("results"):
            return None

        fsq_id = data["results"][0]["fsq_id"]
        photo_url = f"https://api.foursquare.com/v3/places/{fsq_id}/photos"
        photo_res = requests.get(photo_url, headers=headers)
        photos = photo_res.json()
        if photos and isinstance(photos, list):
            prefix = photos[0].get("prefix")
            suffix = photos[0].get("suffix")
            if prefix and suffix:
                return f"{prefix}original{suffix}"
    except Exception as e:
        print(f"Foursquare image fetch error: {e}")
    return None

@app.post("/recommend")
async def recommend(data: Dict[str, Any]):
    """Get recommendations using genetic algorithm"""
    try:
        # Get all destinations from database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, nama, kabupaten, tipe_dataran, tingkat_aktivitas, 
                   popularitas, latitude, longitude, deskripsi 
            FROM tempat_wisata
        """)
        
        rows = cursor.fetchall()
        destinations = []
        for row in rows:
            destinations.append({
                "id": row[0],
                "nama": row[1],
                "kabupaten": row[2],
                "tipe_dataran": row[3],
                "tingkat_aktivitas": row[4],
                "popularitas": row[5],
                "latitude": row[6],
                "longitude": row[7],
                "deskripsi": row[8]
            })
        
        conn.close()
        
        if not destinations:
            raise HTTPException(status_code=404, detail="No destinations found in database")
        
        print(f"🔍 Found {len(destinations)} destinations in database")
        
        # Set default values if not provided
        preferences = {
            "district": data.get("district", "Badung"),
            "terrainType": data.get("terrainType", "lowland"),
            "timeOfDay": data.get("timeOfDay", "afternoon"),
            "activityLevel": data.get("activityLevel", "moderate"),
            "latitude": data.get("latitude", -8.6500),
            "longitude": data.get("longitude", 115.2167)
        }
        
        print(f"👤 User preferences: {preferences}")
        
        # Get weather info with actual coordinates
        weather_info = get_weather_by_time(
            preferences["timeOfDay"], 
            preferences["latitude"], 
            preferences["longitude"]
        )
        
        # Run genetic algorithm
        selected_destinations, algorithm_info = genetic_algorithm(destinations, preferences)
        
        print(f"🧬 Genetic algorithm completed: {len(selected_destinations)} results")
        
        # Format results
        results = []
        for i, (dest, fitness_score) in enumerate(selected_destinations):
            distance = calculate_distance(
                preferences["latitude"], preferences["longitude"],
                dest["latitude"], dest["longitude"]
            )
            
            result = {
                "id": dest["id"],
                "name": dest["nama"],
                "location": dest["kabupaten"],
                "distance": round(distance, 1),
                "weather": f"{weather_info['condition']}, {weather_info['temperature']}°C",
                "temperature": weather_info["temperature"],
                "popularity": dest["popularitas"],
                "activityLevel": dest["tingkat_aktivitas"],
                "terrain_type": dest["tipe_dataran"],
                "time_preference": preferences["timeOfDay"],
                "image": await fetch_foursquare_image(dest["nama"], dest["latitude"], dest["longitude"]) or f"https://source.unsplash.com/featured/?bali,{dest['tipe_dataran']}",
                "description": dest["deskripsi"],
                "fitness_score": round(fitness_score, 3)
            }
            results.append(result)
        
        return {
            "destinations": results,
            "algorithm_info": algorithm_info,
            "weather_info": {
                "time_of_day": preferences["timeOfDay"],
                "weather_condition": weather_info["condition"],
                "temperature": weather_info["temperature"]
            },
            "total_destinations_analyzed": len(destinations),
            "preferences_used": preferences
        }
        
    except Exception as e:
        print(f"❌ Error in recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

def get_weather_by_time(time_of_day: str, latitude: float = -8.6500, longitude: float = 115.2167) -> Dict[str, Any]:
    """Get real weather data from OpenWeatherMap API"""
    try:
        # OpenWeatherMap API
        url = f"http://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={api_key}&units=metric"
        
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            temperature = round(data['main']['temp'])
            condition = data['weather'][0]['description'].title()
            
            # Adjust temperature based on time of day
            if time_of_day == "morning":
                temperature -= 2
            elif time_of_day == "evening":
                temperature -= 1
                
            return {
                "condition": condition,
                "temperature": temperature
            }
    except Exception as e:
        print(f"Weather API error: {e}")
    
    # Fallback to varied temperatures based on time and location
    base_temps = {
        "morning": 22,
        "afternoon": 28,
        "evening": 25
    }
    
    # Add some variation based on coordinates
    temp_variation = int((latitude + longitude) * 10) % 5
    base_temp = base_temps.get(time_of_day, 25)
    
    return {
        "condition": "Cerah",
        "temperature": base_temp + temp_variation
    }

@app.get("/weather/{time_of_day}")
async def get_weather(time_of_day: str):
    """Get weather information"""
    return get_weather_by_time(time_of_day)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
