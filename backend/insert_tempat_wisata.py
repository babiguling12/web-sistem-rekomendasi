import json

with open(r"C:\Users\Gustu\Documents\TUGAS KULIAH\PBL\web-sistem-rekomendasi\backend\places.json", "r", encoding="utf-8") as f:
    data = json.load(f)

values = []
for i, ftr in enumerate(data["features"], 1):
    p = ftr["properties"]
    g = ftr["geometry"]["coordinates"]

    name = p.get("name", "Tanpa Nama").replace("'", "''")
    lat, lon = g[1], g[0]
    kode = f"DST{i:03}"

    # Gabungkan semua kategori jadi string kecil, pisahkan koma
    categories_list = p.get("categories", [])
    categories = ",".join(categories_list).lower().replace("'", "''")

    # Tentukan tipedataran_id
    if "natural.mountain" in categories or "peak" in categories:
        tipedataran_id = 1 # dataran tinggi
    elif any(x in categories for x in ["natural.forest", "park", "garden"]):
        tipedataran_id = 2 # dataran rendah
    elif any(x in categories for x in ["natural.water", "lake", "river"]):
        tipedataran_id = 3 # perairan
    else:
        tipedataran_id = 2 # default rendah

    # Tentukan tipeaktivitas_id: 1 - santai, 2 - sedang, 3 - ekstrem
    if any(x in categories for x in ["temple", "monument", "museum", "park", "cultural", "heritage", "memorial"]):
        tipeaktivitas_id = 1  # santai
    elif any(x in categories for x in [
        "forest", "zoo", "garden", "hiking", "recreation", "nature",
        "walk", "reserve", "jungle", "trail", "track"
    ]):
        tipeaktivitas_id = 2  # sedang
    elif any(x in categories for x in ["mountain", "peak", "climbing", "trekking", "diving", "extreme"]):
        tipeaktivitas_id = 3  # ekstrem
    else:
        tipeaktivitas_id = 1  # default santai

    # Peta kabupaten
    kabupaten_map = {
        "Badung": 1, "Bangli": 2, "Buleleng": 3, "Gianyar": 4, "Jembrana": 5,
        "Karangasem": 6, "Klungkung": 7, "Tabanan": 8, "Denpasar": 9,
        "Klungkung Regency": 7
    }
    kabupaten_id = kabupaten_map.get(p.get("county", ""), 0)
    if kabupaten_id == 0:
        continue

    # Tambahkan kolom 'categories' ke dalam INSERT
    values.append(f"('{kode}', '{name}', {lat}, {lon}, {tipedataran_id}, {tipeaktivitas_id}, {kabupaten_id})")

# Tulis ke file SQL baru
with open("insert_destinasi_multi.sql", "w", encoding="utf-8") as f:
    f.write("INSERT INTO destinasi (kode, nama, latitude, longitude, tipedataran_id, tipeaktivitas_id, kabupaten_id)\nVALUES\n")
    f.write(",\n".join(values) + ";\n")
