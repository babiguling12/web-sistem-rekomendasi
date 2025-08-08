# import psycopg2
# import requests
# from datetime import datetime

# # Konfigurasi koneksi PostgreSQL
# DB_CONFIG = {
#     "host": "shinkansen.proxy.rlwy.net",
#     "dbname": "railway",
#     "user": "postgres",
#     "password": "brLwNtkGPeciXAnaJURvwlEQTLbQQXNy",
#     "port": 38183
# }

# def interpret_weathercode(code, temps):
#     if code == 0:
#         return "Cerah"
#     elif code in [1, 2, 3]:
#         return "Berawan"
#     else:
#         return "Hujan"

# def fetch_weather(lat, lon):
#     url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m,weathercode&timezone=Asia/Bangkok"
#     try:
#         resp = requests.get(url)
#         data = resp.json()
#         times = data["hourly"]["time"]
#         codes = data["hourly"]["weathercode"]
#         temps = data["hourly"]["temperature_2m"]
        
#         result = {}
#         for hour in ["06:00", "12:00", "18:00"]:
#             target_time = datetime.now().strftime("%Y-%m-%dT") + hour
#             if target_time in times:
#                 idx = times.index(target_time)
#                 temp = temps[idx]
#                 code = codes[idx]
#                 result[hour] = (interpret_weathercode(code, temp), temp)
                
#         return result
    
#     except Exception as e:
#         print(f"❌ Error fetching weather: {e}")
#         return {}

# def update_weather():
#     conn = psycopg2.connect(**DB_CONFIG)
#     cursor = conn.cursor()

#     today = datetime.now().strftime("%Y-%m-%d")

#     # Hapus data lama untuk tanggal yang sama
#     cursor.execute("DELETE FROM waktureal WHERE tanggal = %s", (today,))

#     # Ambil semua destinasi
#     cursor.execute("SELECT kode, latitude, longitude FROM destinasi")
#     destinasi_list = cursor.fetchall()

#     for kode, lat, lon in destinasi_list:
#         cuaca = fetch_weather(lat, lon)
#         for jam, (kondisi, suhu) in cuaca.items():
#             if jam == "06:00":
#                 jeniswaktu_id = 1  # pagi
#             elif jam == "12:00":
#                 jeniswaktu_id = 2  # siang
#             elif jam == "18:00":
#                 jeniswaktu_id = 3  # sore
#             else:
#                 continue

#             cursor.execute("""
#                 INSERT INTO waktureal (tanggal, jam, kondisi, temperature, jeniswaktu_id, destinasi_kode)
#                 VALUES (%s, %s, %s, %s, %s, %s)
#             """, (today, jam, kondisi, suhu, jeniswaktu_id, kode))

#             print(f"✅ {kode} - {jam} - {kondisi}")

#     conn.commit()
#     cursor.close()
#     conn.close()
#     print(f"\n✅ Update cuaca real {today} selesai!")

# if __name__ == "__main__":
#     update_weather()

import psycopg2
import aiohttp
import asyncio
from datetime import datetime

# Konfigurasi koneksi PostgreSQL
DB_CONFIG = {
    "host": "shinkansen.proxy.rlwy.net",
    "dbname": "railway",
    "user": "postgres",
    "password": "brLwNtkGPeciXAnaJURvwlEQTLbQQXNy",
    "port": 38183
}

def interpret_weathercode(code, temps):
    if code == 0:
        return "Cerah"
    elif code in [1, 2, 3]:
        return "Berawan"
    else:
        return "Hujan"

async def fetch_weather(session, lat, lon):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m,weathercode&timezone=Asia/Bangkok"
    try:
        async with session.get(url, timeout=10) as resp:
            data = await resp.json()
            times = data["hourly"]["time"]
            codes = data["hourly"]["weathercode"]
            temps = data["hourly"]["temperature_2m"]
            
            result = {}
            for hour in ["06:00", "12:00", "18:00"]:
                target_time = datetime.now().strftime("%Y-%m-%dT") + hour
                if target_time in times:
                    idx = times.index(target_time)
                    temp = temps[idx]
                    code = codes[idx]
                    result[hour] = (interpret_weathercode(code, temp), temp)
            return result
    except Exception as e:
        print(f"❌ Error fetching weather ({lat},{lon}): {e}")
        return {}

async def process_destinasi(session, dest, today, cache):
    kode, lat, lon = dest

    if (lat, lon) in cache:
        cuaca = cache[(lat, lon)]
    else:
        cuaca = await fetch_weather(session, lat, lon)
        cache[(lat, lon)] = cuaca

    rows = []
    for jam, (kondisi, suhu) in cuaca.items():
        if jam == "06:00":
            jeniswaktu_id = 1
        elif jam == "12:00":
            jeniswaktu_id = 2
        elif jam == "18:00":
            jeniswaktu_id = 3
        else:
            continue
        rows.append((today, jam, kondisi, suhu, jeniswaktu_id, kode))
        print(f"✅ {kode} - {jam} - {kondisi}")
    return rows

async def update_weather_async():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    today = datetime.now().strftime("%Y-%m-%d")

    # Hapus data lama
    cursor.execute("DELETE FROM waktureal WHERE tanggal = %s", (today,))

    # Ambil destinasi dari DB
    cursor.execute("SELECT kode, latitude, longitude FROM destinasi")
    destinasi_list = cursor.fetchall()

    cache = {}
    all_rows = []

    async with aiohttp.ClientSession() as session:
        tasks = [process_destinasi(session, dest, today, cache) for dest in destinasi_list]
        results = await asyncio.gather(*tasks)
        for r in results:
            all_rows.extend(r)

    # Batch insert
    cursor.executemany("""
        INSERT INTO waktureal (tanggal, jam, kondisi, temperature, jeniswaktu_id, destinasi_kode)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, all_rows)

    conn.commit()
    cursor.close()
    conn.close()
    print(f"\n✅ Update cuaca real {today} selesai!")

if __name__ == "__main__":
    asyncio.run(update_weather_async())
