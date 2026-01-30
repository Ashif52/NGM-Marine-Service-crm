@echo off
echo 🚀 Starting NMG Marine Backend...

cd backend

echo 📦 Activating Python virtual environment...
call venv\Scripts\activate

echo 📦 Installing dependencies...
pip install -r requirements.txt

echo 🔥 Starting FastAPI server...
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause
