import random
import numpy as np
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from models import Destinasi, Kabupaten, TipeDataran, TipeAktivitas
from crud import get_destinasi_by_filters
import math

# Define the destination class
# class Destination:
#     def __init__(self, id: int, name: str, location: str, terrain_type: str, 
#                  activity_level: str, best_times: List[str], latitude: float, 
#                  longitude: float, popularity: float):
#         self.id = id
#         self.name = name
#         self.location = location
#         self.terrain_type = terrain_type
#         self.activity_level = activity_level
#         self.best_times = best_times
#         self.latitude = latitude
#         self.longitude = longitude
#         self.popularity = popularity

# Sample data - in a real implementation, this would come from a database or API
# sample_destinations = [
#     Destination(1, "Pantai Kuta", "Badung", "lowland", "moderate", ["morning", "afternoon", "evening"], -8.7180, 115.1686, 4.7),
#     Destination(2, "Air Terjun Tegenungan", "Gianyar", "water", "moderate", ["morning", "afternoon"], -8.5956, 115.2882, 4.5),
#     Destination(3, "Tegalalang Rice Terrace", "Gianyar", "highland", "relaxed", ["morning", "afternoon"], -8.4312, 115.2767, 4.8),
#     Destination(4, "Pantai Nusa Dua", "Badung", "lowland", "relaxed", ["morning", "afternoon", "evening"], -8.8008, 115.2317, 4.6),
#     Destination(5, "Gunung Batur", "Bangli", "highland", "extreme", ["morning"], -8.2424, 115.3754, 4.9),
#     Destination(6, "Pantai Sanur", "Denpasar", "lowland", "relaxed", ["morning", "afternoon", "evening"], -8.6783, 115.2636, 4.4),
#     Destination(7, "Air Terjun Gitgit", "Buleleng", "water", "moderate", ["morning", "afternoon"], -8.1894, 115.1311, 4.3),
#     Destination(8, "Pura Ulun Danu Bratan", "Tabanan", "water", "relaxed", ["morning", "afternoon"], -8.2755, 115.1678, 4.7),
#     Destination(9, "Pantai Amed", "Karangasem", "lowland", "moderate", ["morning", "afternoon"], -8.3365, 115.6501, 4.6),
#     Destination(10, "Gunung Agung", "Karangasem", "highland", "extreme", ["morning"], -8.3425, 115.5030, 4.8),
#     # Add more destinations as needed
# ]

# Calculate distance between two points using Haversine formula
def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth radius in kilometers
    
    # Convert latitude and longitude from degrees to radians
    lat1_rad = np.radians(lat1)
    lon1_rad = np.radians(lon1)
    lat2_rad = np.radians(lat2)
    lon2_rad = np.radians(lon2)
    
    # Haversine formula
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad
    a = np.sin(dlat/2)**2 + np.cos(lat1_rad) * np.cos(lat2_rad) * np.sin(dlon/2)**2
    c = 2 * np.arcsin(np.sqrt(a))
    distance = R * c
    
    return distance

# Fitness function to evaluate how well a destination matches user preferences
# def calculate_fitness(destination: Destination, user_lat: float, user_lon: float, 
#                       preferred_district: str, preferred_terrain: str, 
#                       preferred_time: str, preferred_activity: str) -> float:
    
#     # Calculate distance score (closer is better)
#     distance = calculate_distance(user_lat, user_lon, destination.latitude, destination.longitude)
#     distance_score = 1 / (1 + distance)  # Normalize to 0-1 range
    
#     # Calculate district match score
#     district_score = 1.0 if destination.location.lower() == preferred_district.lower() else 0.5
    
#     # Calculate terrain type match score
#     terrain_score = 1.0 if destination.terrain_type == preferred_terrain else 0.3
    
#     # Calculate time match score
#     time_score = 1.0 if preferred_time in destination.best_times else 0.3
    
#     # Calculate activity level match score
#     activity_score = 1.0 if destination.activity_level == preferred_activity else 0.3
    
#     # Calculate popularity score
#     popularity_score = destination.popularity / 5.0  # Normalize to 0-1 range
    
#     # Weighted sum of all scores
#     weights = {
#         'distance': 0.2,
#         'district': 0.15,
#         'terrain': 0.2,
#         'time': 0.15,
#         'activity': 0.2,
#         'popularity': 0.1
#     }
    
#     fitness = (
#         weights['distance'] * distance_score +
#         weights['district'] * district_score +
#         weights['terrain'] * terrain_score +
#         weights['time'] * time_score +
#         weights['activity'] * activity_score +
#         weights['popularity'] * popularity_score
#     )
    
#     return fitness

def calculate_fitness(
    destination: Destinasi, 
    user_lat: float, 
    user_lon: float,
    preferred_district: str, 
    preferred_terrain: str,
    preferred_activity: str,
    weather_score: float = 1.0
) -> float:
    """Calculate fitness score for a destination"""
    
    # Calculate distance score (closer is better)
    distance = calculate_distance(user_lat, user_lon, destination.latitude, destination.longitude)
    distance_score = 1 / (1 + distance * 0.1)  # Normalize distance impact
    
    # Calculate district match score
    district_score = 1.0 if destination.kabupaten.nama.lower() == preferred_district.lower() else 0.3
    
    # Calculate terrain type match score
    terrain_score = 1.0 if destination.tipe_dataran.tipe == preferred_terrain else 0.2
    
    # Calculate activity level match score
    activity_score = 1.0 if destination.tipe_aktivitas.tipe == preferred_activity else 0.2
    
    # Base popularity score (simulated based on destination type)
    popularity_score = get_popularity_score(destination)
    
    # Weighted sum of all scores
    weights = {
        'distance': 0.25,
        'district': 0.15,
        'terrain': 0.25,
        'activity': 0.20,
        'popularity': 0.10,
        'weather': 0.05
    }
    
    fitness = (
        weights['distance'] * distance_score +
        weights['district'] * district_score +
        weights['terrain'] * terrain_score +
        weights['activity'] * activity_score +
        weights['popularity'] * popularity_score +
        weights['weather'] * weather_score
    )
    
    return fitness

def get_popularity_score(destination: Destinasi) -> float:
    """Get simulated popularity score based on destination characteristics"""
    # Simulate popularity based on destination name and type
    popular_keywords = ['pantai', 'kuta', 'sanur', 'nusa dua', 'ubud', 'batur', 'bratan']
    name_lower = destination.nama.lower()
    
    base_score = 0.6
    for keyword in popular_keywords:
        if keyword in name_lower:
            base_score += 0.1
    
    # Adjust based on activity type
    if destination.tipe_aktivitas.tipe == 'relaxed':
        base_score += 0.1
    elif destination.tipe_aktivitas.tipe == 'extreme':
        base_score += 0.2
    
    return min(base_score, 1.0)

# Genetic Algorithm implementation
# def genetic_algorithm(destinations: List[Destination], user_lat: float, user_lon: float,
#                      preferred_district: str, preferred_terrain: str,
#                      preferred_time: str, preferred_activity: str,
#                      population_size: int = 50, generations: int = 100,
#                      elite_size: int = 10, mutation_rate: float = 0.1) -> List[Destination]:
    
#     # Calculate fitness for each destination
#     destination_fitness = []
#     for dest in destinations:
#         fitness = calculate_fitness(
#             dest, user_lat, user_lon, preferred_district,
#             preferred_terrain, preferred_time, preferred_activity
#         )
#         destination_fitness.append((dest, fitness))
    
#     # Sort destinations by fitness (descending)
#     destination_fitness.sort(key=lambda x: x[1], reverse=True)
    
#     # Return top 5 destinations
#     top_destinations = [dest for dest, _ in destination_fitness[:5]]
    
#     return top_destinations

def genetic_algorithm_selection(
    destinations: List[Destinasi],
    user_lat: float,
    user_lon: float,
    preferred_district: str,
    preferred_terrain: str,
    preferred_activity: str,
    weather_score: float = 1.0,
    top_n: int = 5
) -> List[tuple]:
    """Select top destinations using genetic algorithm principles"""
    
    # Calculate fitness for each destination
    destination_fitness = []
    for dest in destinations:
        fitness = calculate_fitness(
            dest, user_lat, user_lon, preferred_district,
            preferred_terrain, preferred_activity, weather_score
        )
        destination_fitness.append((dest, fitness))
    
    # Sort by fitness (descending)
    destination_fitness.sort(key=lambda x: x[1], reverse=True)
    
    # Apply genetic algorithm selection (tournament selection)
    selected = []
    population_size = min(len(destination_fitness), 20)
    tournament_size = 3
    
    for _ in range(top_n):
        # Tournament selection
        tournament = random.sample(destination_fitness[:population_size], 
                                 min(tournament_size, population_size))
        winner = max(tournament, key=lambda x: x[1])
        
        if winner not in selected:
            selected.append(winner)
        
        # Remove winner from population to avoid duplicates
        destination_fitness.remove(winner)
    
    return selected

# Function to process user request and return recommendations
# def get_recommendations(user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
#     # Extract user preferences
#     user_lat = user_data.get('latitude', -8.6500)  # Default to Denpasar if not provided
#     user_lon = user_data.get('longitude', 115.2167)
#     preferred_district = user_data.get('district', '')
#     preferred_terrain = user_data.get('terrainType', 'highland')
#     preferred_time = user_data.get('timeOfDay', 'morning')
#     preferred_activity = user_data.get('activityLevel', 'relaxed')
    
#     # Get recommendations using genetic algorithm
#     recommended_destinations = genetic_algorithm(
#         sample_destinations, user_lat, user_lon)


# Let's update the recommendation form to connect with our API:

def get_recommendations_with_weather(db: Session, user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Get recommendations using genetic algorithm with weather consideration"""
    
    # Get all destinations from database
    all_destinations = db.query(Destinasi).join(Kabupaten).join(TipeDataran).join(TipeAktivitas).all()
    
    if not all_destinations:
        return []
    
    # Calculate weather score based on time of day
    weather_info = user_data.get('weather', {})
    weather_score = 1.0
    
    if weather_info.get('condition') == 'Cerah':
        weather_score = 1.2  # Boost for sunny weather
    elif weather_info.get('condition') == 'Berawan':
        weather_score = 1.0  # Neutral for cloudy
    elif weather_info.get('condition') == 'Mendung':
        weather_score = 0.9  # Slight penalty for overcast
    
    # Use genetic algorithm to select best destinations
    selected_destinations = genetic_algorithm_selection(
        all_destinations,
        user_data['latitude'],
        user_data['longitude'],
        user_data['district'],
        user_data['terrainType'],
        user_data['activityLevel'],
        weather_score
    )
    
    # Format results
    recommendations = []
    for i, (dest, fitness_score) in enumerate(selected_destinations):
        distance = calculate_distance(
            user_data['latitude'], user_data['longitude'],
            dest.latitude, dest.longitude
        )
        
        # Generate description based on destination characteristics
        description = generate_description(dest)
        
        recommendation = {
            "id": i + 1,
            "kode": dest.kode,
            "name": dest.nama,
            "location": dest.kabupaten.nama,
            "distance": f"{distance:.1f} km",
            "weather": f"{weather_info.get('condition', 'Cerah')}, {weather_info.get('temperature', 25)}°C",
            "popularity": round(get_popularity_score(dest) * 5, 1),  # Convert to 5-point scale
            "activityLevel": get_activity_level_indonesian(dest.tipe_aktivitas.tipe),
            "image": f"/placeholder.svg?height=200&width=400&text={dest.nama.replace(' ', '%20')}",
            "description": description,
            "latitude": dest.latitude,
            "longitude": dest.longitude,
            "fitness_score": fitness_score,
            "weather_condition": weather_info.get('condition', 'Cerah'),
            "weather_temperature": weather_info.get('temperature', 25)
        }
        recommendations.append(recommendation)
    
    return recommendations

def generate_description(destination: Destinasi) -> str:
    """Generate description based on destination characteristics"""
    
    terrain_descriptions = {
        'highland': 'dengan pemandangan pegunungan yang menakjubkan',
        'lowland': 'dengan suasana dataran rendah yang asri',
        'water': 'dengan keindahan perairan yang memukau'
    }
    
    activity_descriptions = {
        'relaxed': 'Cocok untuk bersantai dan menikmati keindahan alam',
        'moderate': 'Menawarkan aktivitas yang menyenangkan dengan tingkat kesulitan sedang',
        'extreme': 'Menantang untuk para petualang dengan aktivitas ekstrem'
    }
    
    terrain_desc = terrain_descriptions.get(destination.tipe_dataran.tipe, '')
    activity_desc = activity_descriptions.get(destination.tipe_aktivitas.tipe, '')
    
    return f"{destination.nama} adalah destinasi wisata di {destination.kabupaten.nama} {terrain_desc}. {activity_desc}."

def get_activity_level_indonesian(activity_level: str) -> str:
    """Convert activity level to Indonesian"""
    mapping = {
        'relaxed': 'Santai',
        'moderate': 'Sedang',
        'extreme': 'Ekstrem'
    }
    return mapping.get(activity_level, 'Sedang')
from sqlalchemy.orm import Session
import models
import math
import random
from typing import Dict, Any, List

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth radius in kilometers
    
    # Convert latitude and longitude from degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lat2)
    
    # Haversine formula
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    
    return distance

def fitness_function(destination, preferences):
    """Calculate fitness score for a destination based on user preferences"""
    score = 0
    
    # Distance score (closer is better)
    distance = calculate_distance(
        preferences["latitude"], 
        preferences["longitude"], 
        destination.latitude, 
        destination.longitude
    )
    distance_score = max(0, 100 - distance * 5)  # Decrease score as distance increases
    
    # Location match
    location_score = 100 if destination.kabupaten == preferences["location"] else 50
    
    # Terrain type match
    terrain_score = 100 if destination.tipe_dataran == preferences["terrain_type"] else 50
    
    # Activity level match
    activity_match = {
        "Rendah": ["Rendah"],
        "Sedang": ["Rendah", "Sedang"],
        "Tinggi": ["Rendah", "Sedang", "Tinggi"]
    }
    activity_score = 100 if destination.tingkat_aktivitas in activity_match[preferences["activity_level"]] else 30
    
    # Weather compatibility
    weather_score = 80  # Default score
    
    # Popularity score
    popularity_score = destination.popularitas * 20  # Scale from 0-5 to 0-100
    
    # Calculate weighted score
    score = (
        distance_score * 0.3 +
        location_score * 0.15 +
        terrain_score * 0.15 +
        activity_score * 0.15 +
        weather_score * 0.1 +
        popularity_score * 0.15
    )
    
    # Add distance to destination object for later use
    destination.distance = distance
    
    return score

def genetic_algorithm_recommend(db: Session, preferences: Dict[str, Any], population_size=20, generations=5):
    """
    Implement genetic algorithm to recommend destinations
    """
    # Get all destinations from database
    all_destinations = db.query(models.TempatWisata).all()
    
    if not all_destinations:
        return []
    
    # Initial population - random selection of destinations
    population = random.sample(all_destinations, min(population_size, len(all_destinations)))
    
    # Evolution over generations
    for _ in range(generations):
        # Calculate fitness for each destination
        fitness_scores = [(destination, fitness_function(destination, preferences)) 
                         for destination in population]
        
        # Sort by fitness score (descending)
        fitness_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Select top performers (50%)
        elite_size = max(2, population_size // 2)
        elite = [item[0] for item in fitness_scores[:elite_size]]
        
        # Create new population with elite members
        new_population = elite.copy()
        
        # Add some random destinations to maintain diversity
        remaining_spots = population_size - len(new_population)
        if remaining_spots > 0:
            # Filter out destinations already in new_population
            available_destinations = [d for d in all_destinations if d not in new_population]
            if available_destinations:
                random_selections = random.sample(
                    available_destinations, 
                    min(remaining_spots, len(available_destinations))
                )
                new_population.extend(random_selections)
        
        population = new_population
    
    # Calculate final fitness scores
    final_scores = [(destination, fitness_function(destination, preferences)) 
                   for destination in population]
    
    # Sort by fitness score (descending)
    final_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Return top 5 destinations
    return [item[0] for item in final_scores[:5]]
