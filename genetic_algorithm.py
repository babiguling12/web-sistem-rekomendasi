import random
import numpy as np
import json
from typing import List, Dict, Any

# Define the destination class
class Destination:
    def __init__(self, id: int, name: str, location: str, terrain_type: str, 
                 activity_level: str, best_times: List[str], latitude: float, 
                 longitude: float, popularity: float):
        self.id = id
        self.name = name
        self.location = location
        self.terrain_type = terrain_type
        self.activity_level = activity_level
        self.best_times = best_times
        self.latitude = latitude
        self.longitude = longitude
        self.popularity = popularity

# Sample data - in a real implementation, this would come from a database or API
sample_destinations = [
    Destination(1, "Pantai Kuta", "Badung", "lowland", "moderate", ["morning", "afternoon", "evening"], -8.7180, 115.1686, 4.7),
    Destination(2, "Air Terjun Tegenungan", "Gianyar", "water", "moderate", ["morning", "afternoon"], -8.5956, 115.2882, 4.5),
    Destination(3, "Tegalalang Rice Terrace", "Gianyar", "highland", "relaxed", ["morning", "afternoon"], -8.4312, 115.2767, 4.8),
    Destination(4, "Pantai Nusa Dua", "Badung", "lowland", "relaxed", ["morning", "afternoon", "evening"], -8.8008, 115.2317, 4.6),
    Destination(5, "Gunung Batur", "Bangli", "highland", "extreme", ["morning"], -8.2424, 115.3754, 4.9),
    Destination(6, "Pantai Sanur", "Denpasar", "lowland", "relaxed", ["morning", "afternoon", "evening"], -8.6783, 115.2636, 4.4),
    Destination(7, "Air Terjun Gitgit", "Buleleng", "water", "moderate", ["morning", "afternoon"], -8.1894, 115.1311, 4.3),
    Destination(8, "Pura Ulun Danu Bratan", "Tabanan", "water", "relaxed", ["morning", "afternoon"], -8.2755, 115.1678, 4.7),
    Destination(9, "Pantai Amed", "Karangasem", "lowland", "moderate", ["morning", "afternoon"], -8.3365, 115.6501, 4.6),
    Destination(10, "Gunung Agung", "Karangasem", "highland", "extreme", ["morning"], -8.3425, 115.5030, 4.8),
    # Add more destinations as needed
]

# Calculate distance between two points using Haversine formula
def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
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
def calculate_fitness(destination: Destination, user_lat: float, user_lon: float, 
                      preferred_district: str, preferred_terrain: str, 
                      preferred_time: str, preferred_activity: str) -> float:
    
    # Calculate distance score (closer is better)
    distance = calculate_distance(user_lat, user_lon, destination.latitude, destination.longitude)
    distance_score = 1 / (1 + distance)  # Normalize to 0-1 range
    
    # Calculate district match score
    district_score = 1.0 if destination.location.lower() == preferred_district.lower() else 0.5
    
    # Calculate terrain type match score
    terrain_score = 1.0 if destination.terrain_type == preferred_terrain else 0.3
    
    # Calculate time match score
    time_score = 1.0 if preferred_time in destination.best_times else 0.3
    
    # Calculate activity level match score
    activity_score = 1.0 if destination.activity_level == preferred_activity else 0.3
    
    # Calculate popularity score
    popularity_score = destination.popularity / 5.0  # Normalize to 0-1 range
    
    # Weighted sum of all scores
    weights = {
        'distance': 0.2,
        'district': 0.15,
        'terrain': 0.2,
        'time': 0.15,
        'activity': 0.2,
        'popularity': 0.1
    }
    
    fitness = (
        weights['distance'] * distance_score +
        weights['district'] * district_score +
        weights['terrain'] * terrain_score +
        weights['time'] * time_score +
        weights['activity'] * activity_score +
        weights['popularity'] * popularity_score
    )
    
    return fitness

# Genetic Algorithm implementation
def genetic_algorithm(destinations: List[Destination], user_lat: float, user_lon: float,
                     preferred_district: str, preferred_terrain: str,
                     preferred_time: str, preferred_activity: str,
                     population_size: int = 50, generations: int = 100,
                     elite_size: int = 10, mutation_rate: float = 0.1) -> List[Destination]:
    
    # Calculate fitness for each destination
    destination_fitness = []
    for dest in destinations:
        fitness = calculate_fitness(
            dest, user_lat, user_lon, preferred_district,
            preferred_terrain, preferred_time, preferred_activity
        )
        destination_fitness.append((dest, fitness))
    
    # Sort destinations by fitness (descending)
    destination_fitness.sort(key=lambda x: x[1], reverse=True)
    
    # Return top 5 destinations
    top_destinations = [dest for dest, _ in destination_fitness[:5]]
    
    return top_destinations

# Function to process user request and return recommendations
def get_recommendations(user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    # Extract user preferences
    user_lat = user_data.get('latitude', -8.6500)  # Default to Denpasar if not provided
    user_lon = user_data.get('longitude', 115.2167)
    preferred_district = user_data.get('district', '')
    preferred_terrain = user_data.get('terrainType', 'highland')
    preferred_time = user_data.get('timeOfDay', 'morning')
    preferred_activity = user_data.get('activityLevel', 'relaxed')
    
    # Get recommendations using genetic algorithm
    recommended_destinations = genetic_algorithm(
        sample_destinations, user_lat, user_lon


Let's update the recommendation form to connect with our API:
