import psycopg2
import json
import os

def create_real_database():
    # Connection URL PostgreSQL
    DATABASE_URL = "postgresql://postgres:brLwNtkGPeciXAnaJURvwlEQTLbQQXNy@shinkansen.proxy.rlwy.net:38183/railway"

    json_path = os.path.join("backend", "places.json")
    print(f"📂 Looking for JSON at: {os.path.abspath(json_path)}")

    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    # Buat tabel
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tipedataran (
        id SERIAL PRIMARY KEY,
        tipe TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS jeniswaktu (
        id SERIAL PRIMARY KEY,
        waktu TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tipeaktivitas (
        id SERIAL PRIMARY KEY,
        tipe TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS kabupaten (
        id SERIAL PRIMARY KEY,
        nama TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS destinasi (
        kode TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        tipedataran_id INTEGER REFERENCES tipedataran(id),
        tipeaktivitas_id INTEGER REFERENCES tipeaktivitas(id),
        kabupaten_id INTEGER REFERENCES kabupaten(id)
    );

    CREATE TABLE IF NOT EXISTS waktureal (
        id SERIAL PRIMARY KEY,
        tanggal TEXT,
        jam TEXT,
        kondisi TEXT,
        temperature DOUBLE PRECISION,
        jeniswaktu_id INTEGER REFERENCES jeniswaktu(id),
        destinasi_kode TEXT REFERENCES destinasi(kode)
    );
    """)

    if not os.path.exists(json_path):
        print(f"❌ places.json not found at {json_path}!")
        conn.close()
        return

    with open(json_path, "r", encoding="utf-8") as f:
        places = json.load(f)["features"]
        print(f"✅ Found {len(places)} places in JSON file")

    # Insert static reference data
    for dataran in [("Dataran Tinggi",), ("Dataran Rendah",), ("Perairan",)]:
        cursor.execute("INSERT INTO tipedataran (tipe) VALUES (%s) ON CONFLICT DO NOTHING", dataran)

    for aktivitas in [("Santai",), ("Sedang",), ("Ekstrem",)]:
        cursor.execute("INSERT INTO tipeaktivitas (tipe) VALUES (%s) ON CONFLICT DO NOTHING", aktivitas)

    kabupaten_map = {
        "Badung": 1, "Bangli": 2, "Buleleng": 3, "Gianyar": 4, "Jembrana": 5,
        "Karangasem": 6, "Klungkung": 7, "Tabanan": 8, "Denpasar": 9,
        "Klungkung Regency": 7
    }
    for kab, kid in kabupaten_map.items():
        cursor.execute(
            "INSERT INTO kabupaten (id, nama) VALUES (%s, %s) ON CONFLICT DO NOTHING",
            (kid, kab)
        )

    for waktu in [("morning",), ("afternoon",), ("evening",)]:
        cursor.execute("INSERT INTO jeniswaktu (waktu) VALUES (%s) ON CONFLICT DO NOTHING", waktu)

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

        categories_lower = [c.lower() for c in categories]
        categories_joined = ",".join(categories_lower)
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
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (kode) DO NOTHING
        """, (kode, nama, latitude, longitude, tipedataran_id, tipeaktivitas_id, kabupaten_id))

        print(f"✅ Inserted {nama} ({kabupaten_name})")

    conn.commit()
    conn.close()
    print("\n✅ All data loaded into PostgreSQL!")

if __name__ == "__main__":
    create_real_database()
