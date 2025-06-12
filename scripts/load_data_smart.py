import sqlite3
import json
import os

def create_real_database():
    """Create database with real data from places.json using correct field names"""
    
    # Path to database and JSON file
    db_path = os.path.join("backend", "rekomendasi_wisata.db")
    json_path = os.path.join("backend", "places.json")
    
    print(f"📂 Looking for JSON at: {os.path.abspath(json_path)}")
    
    # Remove old database if exists
    if os.path.exists(db_path):
        os.remove(db_path)
        print("✅ Removed old database")
    
    # Create new database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # First, check JSON structure
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            try:
                places_data = json.load(f)
                print(f"✅ Found {len(places_data['features'])} places in JSON file")
            except json.JSONDecodeError as e:
                print(f"❌ Error parsing JSON: {str(e)}")
                # Try to read the first few lines to debug
                f.seek(0)
                print("📄 First 100 characters of file:")
                print(f.read(100))
                return
    else:
        print(f"❌ places.json not found at {json_path}!")
        # List files in backend directory to help debug
        backend_dir = os.path.join("backend")
        if os.path.exists(backend_dir):
            print(f"📂 Files in {backend_dir} directory:")
            for file in os.listdir(backend_dir):
                print(f"  - {file}")
        return
    
    if not places_data:
        print("❌ No data found in places.json!")
        return
        
    # Create table based on actual JSON structure
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tempat_wisata (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nama TEXT NOT NULL,
            kabupaten TEXT,
            tipe_dataran TEXT,
            tingkat_aktivitas TEXT,
            popularitas REAL,
            latitude REAL,
            longitude REAL,
            deskripsi TEXT
        )
    ''')
    
    # Insert data with field mapping
    for feature in places_data['features']:
        properties = feature['properties']
        
        nama = properties.get('name', 'Unknown Place')
        kabupaten = properties.get('county', 'Unknown')
        tipe_dataran = properties.get('categories', ['Unknown'])[0]  # Take the first category
        
        # Handle missing or non-numeric values
        tingkat_aktivitas = properties.get('name') or 'Sedang'
        popularitas = properties.get('rating') or 4.0
        latitude = feature['geometry']['coordinates'][1]
        longitude = feature['geometry']['coordinates'][0]
        deskripsi = properties.get('description') or f"Tempat wisata di {kabupaten}"
        
        cursor.execute('''
            INSERT INTO tempat_wisata 
            (nama, kabupaten, tipe_dataran, tingkat_aktivitas, popularitas, latitude, longitude, deskripsi)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (nama, kabupaten, tipe_dataran, tingkat_aktivitas, popularitas, latitude, longitude, deskripsi))
        
        print(f"✅ Added: {nama} ({kabupaten})")
    
    conn.commit()
    
    # Verify data
    cursor.execute("SELECT COUNT(*) FROM tempat_wisata")
    count = cursor.fetchone()[0]
    print(f"\n✅ Database created with {count} destinations")
    
    # Show sample data
    cursor.execute("SELECT nama, kabupaten, tipe_dataran, popularitas FROM tempat_wisata LIMIT 5")
    sample = cursor.fetchall()
    print("\n📍 Sample destinations:")
    for i, (nama, kabupaten, tipe, rating) in enumerate(sample, 1):
        print(f"   {i}. {nama} ({kabupaten}) - {tipe} - Rating: {rating}")
    
    conn.close()
    print(f"\n✅ Database saved to: {db_path}")

if __name__ == "__main__":
    create_real_database()
