import sqlite3
import json
import os

def create_real_database():
    db_path = os.path.join("backend", "rekomendasi_wisata.db")
    json_path = os.path.join("backend", "places.json")

    print(f"📂 Looking for JSON at: {os.path.abspath(json_path)}")

    if os.path.exists(db_path):
        os.remove(db_path)
        print("✅ Removed old database")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS tipedataran (
        id INTEGER PRIMARY KEY,
        tipe TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS jeniswaktu (
        id INTEGER PRIMARY KEY,
        waktu TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tipeaktivitas (
        id INTEGER PRIMARY KEY,
        tipe TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS kabupaten (
        id INTEGER PRIMARY KEY,
        nama TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS destinasi (
        kode TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        tipedataran_id INTEGER,
        tipeaktivitas_id INTEGER,
        kabupaten_id INTEGER,
        FOREIGN KEY (tipedataran_id) REFERENCES tipedataran(id),
        FOREIGN KEY (tipeaktivitas_id) REFERENCES tipeaktivitas(id),
        FOREIGN KEY (kabupaten_id) REFERENCES kabupaten(id)
    );

    CREATE TABLE IF NOT EXISTS jeniswaktu (
        id INTEGER PRIMARY KEY,
        waktu TEXT NOT NULL
    );
                         
    CREATE TABLE IF NOT EXISTS waktureal (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tanggal TEXT,
        jam TEXT,
        kondisi TEXT,
        temperature REAL,
        jeniswaktu_id INTEGER,
        destinasi_kode TEXT,
        FOREIGN KEY (jeniswaktu_id) REFERENCES jeniswaktu(id),
        FOREIGN KEY (destinasi_kode) REFERENCES destinasi(kode)
    );
    """)

    if not os.path.exists(json_path):
        print(f"❌ places.json not found at {json_path}!")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        places = json.load(f)["features"]
        print(f"✅ Found {len(places)} places in JSON file")

    def get_or_create_id(table, column, value):
        cursor.execute(f"SELECT id FROM {table} WHERE {column} = ?", (value,))
        result = cursor.fetchone()
        if result:
            return result[0]
        cursor.execute(f"INSERT INTO {table} ({column}) VALUES (?)", (value,))
        return cursor.lastrowid

    # Insert static reference data
    for dataran in [(1, "Dataran Tinggi"), (2, "Dataran Rendah"), (3, "Perairan")]:
        cursor.execute("INSERT OR IGNORE INTO tipedataran (id, tipe) VALUES (?, ?)", dataran)

    for aktivitas in [(1, "Santai"), (2, "Sedang"), (3, "Ekstrem")]:
        cursor.execute("INSERT OR IGNORE INTO tipeaktivitas (id, tipe) VALUES (?, ?)", aktivitas)

    kabupaten_map = {
        "Badung": 1, "Bangli": 2, "Buleleng": 3, "Gianyar": 4, "Jembrana": 5,
        "Karangasem": 6, "Klungkung": 7, "Tabanan": 8, "Denpasar": 9,
        "Klungkung Regency": 7
    }
    for kab, kid in kabupaten_map.items():
        cursor.execute("INSERT OR IGNORE INTO kabupaten (id, nama) VALUES (?, ?)", (kid, kab))

    for waktu in [(1, "morning"), (2, "afternoon"), (3, "evening")]:
        cursor.execute("INSERT OR IGNORE INTO jeniswaktu (id, waktu) VALUES (?, ?)", waktu)

    for i, place in enumerate(places):
        props = place["properties"]
        geom = place["geometry"]["coordinates"]
        categories = props.get("categories", [])

        nama = props.get("name", f"Destinasi {i+1}")
        kabupaten_name = props.get("county", "")
        latitude = geom[1]
        longitude = geom[0]
        kode = f"D{i+1:04}"

        if "natural.mountain" in categories or "peak" in categories:
            tipedataran_id = 1
        elif any(x in categories for x in ["natural.forest", "park", "garden"]):
            tipedataran_id = 2
        elif any(x in categories for x in ["natural.water", "lake", "river"]):
            tipedataran_id = 3
        else:
            tipedataran_id = 2

        categories = [c.lower() for c in props.get("categories", [])]
        categories_joined = ",".join(categories)
        if any(x in categories_joined for x in ["temple", "monument", "museum", "park", "cultural", "heritage", "memorial"]):
            tipeaktivitas_id = 1
        elif any(x in categories_joined for x in ["forest", "zoo", "garden", "hiking", "recreation", "nature", "walk", "reserve", "jungle", "trail", "track"]):
            tipeaktivitas_id = 2
        elif any(x in categories_joined for x in ["mountain", "peak", "climbing", "trekking", "diving", "extreme"]):
            tipeaktivitas_id = 3
        else:
            tipeaktivitas_id = 1

        kabupaten_id = kabupaten_map.get(kabupaten_name, 0)
        if kabupaten_id == 0:
            continue

        cursor.execute("""
            INSERT INTO destinasi (kode, nama, latitude, longitude, 
                                   tipedataran_id, tipeaktivitas_id, kabupaten_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (kode, nama, latitude, longitude, tipedataran_id, tipeaktivitas_id, kabupaten_id))

        print(f"✅ Inserted {nama} ({kabupaten_name})")

    conn.commit()
    conn.close()
    print("\n✅ All data loaded and saved!")

if __name__ == "__main__":
    create_real_database()
