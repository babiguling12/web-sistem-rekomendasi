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
    db_path = os.path.join(os.path.dirname(__file__), "rekomendasi_wisata.db")
    if not os.path.exists(db_path):
        raise HTTPException(status_code=500, detail="Database not found.")
    return sqlite3.connect(db_path)

# --- Hitung jarak geografis antar dua titik (latitude, longitude) ---
def calculate_distance(lat1, lon1, lat2, lon2):
    # Menghitung jarak antara dua titik koordinat (haversine formula)
    R = 6371  # Jari-jari bumi (km)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# --- Fungsi Fitness: menghitung kecocokan antara destinasi dan preferensi pengguna ---
# --- Fungsi Fitness: menghitung kecocokan antara destinasi dan preferensi pengguna ---
def fitness_function(destination, preferences):
    total_score = 0

     # Penilaian Kabupaten: cocok (4), tidak cocok (0) -> DAN abaikan yang tidak cocok nanti di filter
    if destination["kabupaten"].lower() != preferences["district"].lower():
        return 0 # langsung tidak dihitung jika tidak cocok (didiskualifikasi langsung)
    
    location_score = 4
    total_score += location_score * 1  # bobot 1

    # Penilaian Tipe Dataran: cocok (4), cukup cocok (3), kurang cocok (2) dengan bobot 1.5
    terrain_map = {
        "highland": "Dataran Tinggi",
        "lowland": "Dataran Rendah",
        "water": "Perairan"
    }
    preferred_terrain = terrain_map.get(preferences["terrainType"], "")
    if destination["tipe_dataran"] == preferred_terrain:
        terrain_score = 4
    elif preferred_terrain in destination["tipe_dataran"]:
        terrain_score = 3
    else:
        terrain_score = 2
    total_score += terrain_score * 1.5  # bobot 1.5

    # Penilaian Aktivitas: cocok (4), dekat (3), tidak cocok (1) dengan bobot 1.5
    activity_map = {
        "relaxed": "Santai",
        "moderate": "Sedang",
        "extreme": "Ekstrem"
    }
    preferred_activity = activity_map.get(preferences["activityLevel"], "")
    if destination["tingkat_aktivitas"] == preferred_activity:
        activity_score = 4
    elif (preferred_activity == "Santai" and destination["tingkat_aktivitas"] == "Sedang") or \
         (preferred_activity == "Sedang" and destination["tingkat_aktivitas"] in ["Santai", "Ekstrem"]) or \
         (preferred_activity == "Ekstrem" and destination["tingkat_aktivitas"] == "Sedang"):
        activity_score = 3
    else:
        activity_score = 1
    total_score += activity_score * 1.5  # bobot 1.5

    # Penilaian Popularitas: semakin tinggi rating, semakin besar skor dengan bobot 2
    if destination["popularitas"] >= 4.5:
        popularity_score = 4
    elif destination["popularitas"] >= 4.0:
        popularity_score = 3
    elif destination["popularitas"] >= 3.5:
        popularity_score = 2
    else:
        popularity_score = 1
    total_score += popularity_score * 2  # bobot 2

    # Penilaian Jarak: semakin dekat, semakin besar skor dengan bobot 4 (paling tinggi)
    distance = calculate_distance(
        preferences["latitude"], preferences["longitude"],
        destination["latitude"], destination["longitude"]
    )
    max_distance = 50  # anggap 50 km adalah batas terjauh yang masih relevan
    if distance > max_distance:
        distance_score = 0  # terlalu jauh
    else:
        distance_score = (1 - (distance / max_distance)) * 4  # nilai 0–4, semakin dekat semakin besar
    total_score += distance_score * 4  # bobot paling tinggi

    # Normalisasi skor agar berada dalam rentang 0.0 - 1.0
    max_score = 4*1 + 4*1.5 + 4*1.5 + 4*2 + 4*4
    normalized_score = total_score / max_score
    return round(normalized_score, 3)

# --- Membuat populasi awal secara acak dari daftar destinasi ---
def initialize_population(destinations, population_size):
    if len(destinations) <= population_size:
        return random.sample(destinations, len(destinations))
    return random.sample(destinations, population_size)

# --- Seleksi dengan metode Roulette Wheel ---
def roulette_wheel_selection(population, fitnesses):
    total_fitness = sum(fitnesses)
    pick = random.uniform(0, total_fitness)
    current = 0
    for i, fitness in enumerate(fitnesses):
        current += fitness
        if current >= pick:
            return population[i]
    return population[-1]

# --- Crossover satu titik: mengambil sebagian atribut dari parent lain ---
def one_point_crossover(parent1, parent2):
    child = parent1.copy()
    child["latitude"] = parent2["latitude"]
    child["longitude"] = parent2["longitude"]
    child["tipe_dataran"] = parent2["tipe_dataran"]
    return child

# --- Mutasi: mengganti individu dengan destinasi acak dari populasi ---
def mutate(individual, destinations):
    return random.choice(destinations)

# --- Algoritma Genetika: menghasilkan 5 destinasi terbaik berdasarkan preferensi ---
def genetic_algorithm(destinations, preferences, generations=20, population_size=30, mutation_rate=0.1):
    start_time = datetime.now()

    # Inisialisasi populasi awal secara acak
    population = initialize_population(destinations, population_size)

    # Proses evolusi selama sejumlah generasi
    for generation in range(generations):
        fitness_scores = [fitness_function(dest, preferences) for dest in population]
        selected = [roulette_wheel_selection(population, fitness_scores) for _ in range(population_size)]

        new_population = []
        for i in range(0, population_size - 1, 2):
            parent1 = selected[i]
            parent2 = selected[i + 1]
            child1 = one_point_crossover(parent1, parent2)
            child2 = one_point_crossover(parent2, parent1)
            new_population.extend([child1, child2])

        if population_size % 2 == 1:
            new_population.append(selected[-1])

        # Lakukan mutasi pada sebagian individu
        for i in range(len(new_population)):
            if random.random() < mutation_rate:
                new_population[i] = mutate(new_population[i], destinations)

        population = new_population

    # Evaluasi akhir: hitung skor fitness dan urutkan dari terbaik
    final_scores = [
        (dest, fitness_function(dest, preferences)) 
        for dest in population 
        if fitness_function(dest, preferences) > 0
    ]
    final_scores.sort(key=lambda x: x[1], reverse=True)

    # Pilih hanya destinasi dengan kode unik agar tidak terjadi duplikasi
    seen_kode = set()
    unique_top = []
    for dest, score in final_scores:
        if dest["kode"] in seen_kode:
            continue
        seen_kode.add(dest["kode"])
        unique_top.append((dest, score))
        if len(unique_top) == 5:
            break

    execution_time = (datetime.now() - start_time).total_seconds()

    return unique_top, {
        "generations": generations,
        "population_size": population_size,
        "mutation_rate": mutation_rate,
        "execution_time": execution_time
    }



FOURSQUARE_KEY = "'fsq3fuXG1UpBrEPokg1hPjcotnEi1/1GNAzRBPRc7jqsJCk='"

def fetch_foursquare_image(name: str, lat: float, lon: float) -> str | None:
    try:
        headers = {
            "Authorization": FOURSQUARE_KEY
        }

        # Langkah 1: Search tempat berdasarkan nama dan koordinat
        search_url = f"https://api.foursquare.com/v3/places/search?query={requests.utils.quote(name)}&ll={lat},{lon}&limit=1"
        search_res = requests.get(search_url, headers=headers)
        search_data = search_res.json()

        if not search_data.get("results"):
            return None

        fsq_id = search_data["results"][0]["fsq_id"]

        # Langkah 2: Ambil foto dari fsq_id
        photo_url = f"https://api.foursquare.com/v3/places/{fsq_id}/photos"
        photo_res = requests.get(photo_url, headers=headers)
        photos = photo_res.json()

        if isinstance(photos, list) and len(photos) > 0:
            prefix = photos[0].get("prefix")
            suffix = photos[0].get("suffix")
            if prefix and suffix:
                return f"{prefix}original{suffix}"

    except Exception as e:
        print(f"Foursquare error for '{name}': {e}")

    return None



@app.post("/recommend")
async def recommend(data: Dict[str, Any]):
    try: 
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT d.kode, d.nama, d.latitude, d.longitude, td.tipe, ta.tipe, k.nama, 4.5
            FROM destinasi d
            JOIN tipedataran td ON d.tipedataran_id = td.id
            JOIN tipeaktivitas ta ON d.tipeaktivitas_id = ta.id
            JOIN kabupaten k ON d.kabupaten_id = k.id
        ''')

        rows = cursor.fetchall()
        destinations = []
        for row in rows:
            destinations.append({
                "kode": row[0],
                "nama": row[1],
                "latitude": row[2],
                "longitude": row[3],
                "tipe_dataran": row[4],
                "tingkat_aktivitas": row[5],
                "kabupaten": row[6],
                "popularitas": row[7]
            })

        preferences = {
            "district": data.get("district", "Badung"),
            "terrainType": data.get("terrainType", "lowland"),
            "activityLevel": data.get("activityLevel", "moderate"),
            "timeOfDay": data.get("timeOfDay", "afternoon"),
            "latitude": data.get("latitude", -8.65),
            "longitude": data.get("longitude", 115.2167)
        }

        top_results, algorithm_info = genetic_algorithm(destinations, preferences)

        response = []
        seen_destinations = set()

        for dest, score in top_results:
            if dest["kode"] not in seen_destinations:
                print(f"🎯 Destinasi: {dest['kode']} - {dest['nama']} - {dest['kabupaten']} - {round(score, 3)}")
                seen_destinations.add(dest["kode"])

                # Buat dictionary hasil destinasi dengan detail lengkap
                result_item = {
                    "kode": dest["kode"],
                    "nama": dest["nama"],
                    "kabupaten": dest["kabupaten"],
                    "latitude": dest["latitude"],
                    "longitude": dest["longitude"],
                    "tipe_dataran": dest["tipe_dataran"],
                    "tingkat_aktivitas": dest["tingkat_aktivitas"],
                    "popularitas": dest["popularitas"],
                    "fitness_score": round(score, 3),
                    "image": fetch_foursquare_image(dest["nama"], dest["latitude"], dest["longitude"]) or "/placeholder.svg",
                    "description": f"Destinasi wisata bernama {dest['nama']} di {dest['kabupaten']}.",
                    "distance": calculate_distance(
                        preferences["latitude"], preferences["longitude"],
                        dest["latitude"], dest["longitude"]
                    ),
                    "temperature": random.randint(24, 32),
                    "weather": "Cerah"
                }

                response.append(result_item)

        return {
            "total": len(response),
            "results": response,
            "algorithm_info": algorithm_info,
            "preferences": preferences
        }
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
