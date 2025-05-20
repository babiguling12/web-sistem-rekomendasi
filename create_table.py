import sqlite3

# Buat koneksi ke SQLite
conn = sqlite3.connect("rekomendasi_wisata.db")
cursor = conn.cursor()

# Buat tabel tipedataran
cursor.execute("""
CREATE TABLE IF NOT EXISTS tipedataran (
    id INTEGER PRIMARY KEY,
    tipe TEXT NOT NULL
)
""")

# Buat tabel jeniswaktu
cursor.execute("""
CREATE TABLE IF NOT EXISTS jeniswaktu (
    id INTEGER PRIMARY KEY,
    waktu TEXT NOT NULL
)
""")

# Buat tabel jenisaktivitas
cursor.execute("""
CREATE TABLE IF NOT EXISTS tipeaktivitas (
    id INTEGER PRIMARY KEY,
    tipe TEXT NOT NULL
)
""")

# Buat tabel waktureal
cursor.execute("""
CREATE TABLE IF NOT EXISTS waktureal (
    idwaktureal INTEGER PRIMARY KEY AUTOINCREMENT,
    jeniswaktu_id INTEGER,
    tanggal TEXT,
    jam TEXT,
    kondisi TEXT,
    FOREIGN KEY (jeniswaktu_id) REFERENCES jeniswaktu(id)
)
""")

# Buat tabel destinasi (tanpa auto-increment, gunakan kode)
cursor.execute("""
CREATE TABLE IF NOT EXISTS destinasi (
    kode TEXT PRIMARY KEY,
    latitude REAL,
    longitude REAL,
    tipedataran_id INTEGER,
    tipeaktivitas_id INTEGER,
    namadestinasi TEXT NOT NULL,
    FOREIGN KEY (tipedataran_id) REFERENCES tipedataran(id),
    FOREIGN KEY (tipeaktivitas_id) REFERENCES tipeaktivitas(id)
)
""")

# Buat tabel rekomendasi (bisa dihapus dan diganti setiap kali input baru)
cursor.execute("""
CREATE TABLE IF NOT EXISTS rekomendasi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tanggal TEXT,
    jam TEXT,
    latitude REAL,
    longitude REAL,
    tipedataran_id INTEGER,
    tipeaktivitas_id INTEGER,
    jeniswaktu_id INTEGER,
    destinasi_kode TEXT,
    FOREIGN KEY (tipedataran_id) REFERENCES tipedataran(id),
    FOREIGN KEY (tipeaktivitas_id) REFERENCES tipeaktivitas(id),
    FOREIGN KEY (jeniswaktu_id) REFERENCES jeniswaktu(id),
    FOREIGN KEY (destinasi_kode) REFERENCES destinasi(kode)
)
""")

# Commit dan tutup koneksi
conn.commit()
conn.close()
