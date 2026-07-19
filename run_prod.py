import os
from waitress import serve
from app import app
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"Starting production server (Waitress) on port {port}...")
    serve(app, host='0.0.0.0', port=port)
