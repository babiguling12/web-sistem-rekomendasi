import requests
import json

# URL API Geoapify
url = "https://api.geoapify.com/v2/places"
params = {
    "categories": "natural,tourism.sights",
    "filter": "rect:114.432,-9.135,115.712,-8.045",
    "limit": 500,
    "apiKey": "127ff7e3eabd4484b3db25a082ee6d62"
}

# Ambil data dari API
response = requests.get(url, params=params)

# Konversi ke JSON
data = response.json()

# Simpan ke file
with open("places.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Data berhasil disimpan ke places.json")
