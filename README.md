# [![Typing SVG](https://readme-typing-svg.herokuapp.com?size=22&color=FFFF&lines=Web+Sistem+Rekomendasi;Payu+Melali)](https://git.io/typing-svg) 
> Aplikasi ini membantu wisatawan menemukan destinasi wisata alam di Bali yang sesuai dengan preferensi mereka, seperti jenis dataran (tinggi, rendah, atau perairan), waktu liburan, dan tingkat aktivitas fisik. Sistem ini akan memanfaatkan Algoritma Genetika untuk melakukan pencocokan dan optimasi rekomendasi berdasarkan data dari Geoapify dan cuaca dari Open-Meteo.
## 🛠️ Instalasi
1. Clone Payu Melali
```bash
git clone https://github.com/babiguling12/web-sistem-rekomendas
```
2. Jalankan Script Py
```bash
python scripts/install_requirements.py
python scripts/debug_json.py
python scripts/load_data_smart.py
python scripts/update_weather_to_db.py
```
3. Jalankan Backend
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
4. Jalankan Frontend
```bash
npm run dev
```
