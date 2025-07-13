# web-sistem-rekomendasi

# ~ ~ HOW TO RUN ~ ~
# 1. Open Terminal
# 2. run "python scripts/install_requirements.py" utk menginstall keperluan lib
# 3. run "python scripts/debug_json.py" utk menyesuaikan format json dgn db
# 4. run "python scripts/load_data_smart.py" utk load data json ke db
# 5. run "python scripts/update_weather_to_db.py" utk reload data weather terbaru ke dalam db
# 6. run "cd backend" utk masuk ke folder backend dan run "python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload" untuk menjalankan server FastApi (api relasi backend ~ frontend)
# 7. run "npm run dev" untuk menjalankan program sepenuhnya