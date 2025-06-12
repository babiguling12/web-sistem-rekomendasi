from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class WeatherInfo(BaseModel):
    condition: str
    temperature: int
    description: str

class PreferensiRequest(BaseModel):
    latitude: float
    longitude: float
    district: str
    terrainType: str  # highland, lowland, water
    timeOfDay: str    # morning, afternoon, evening
    activityLevel: str # relaxed, moderate, extreme

class DestinasiResponse(BaseModel):
    kode: str
    nama: str
    latitude: float
    longitude: float
    kabupaten: str
    tipe_dataran: str
    tipe_aktivitas: str
    
    class Config:
        from_attributes = True

class RekomendasiResponse(BaseModel):
    id: int
    name: str
    location: str
    distance: str
    weather: str
    popularity: float
    activityLevel: str
    image: str
    description: str
    latitude: float
    longitude: float
    fitness_score: float
    
    class Config:
        from_attributes = True

class RekomendasiCreate(BaseModel):
    destinasi_kode: str
    fitness_score: float
    weather_condition: str
    weather_temperature: int
