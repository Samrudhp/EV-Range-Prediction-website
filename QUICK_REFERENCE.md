# ⚡ Quick Reference - EV Range Prediction Platform

## 🚀 Start Everything (Fresh Setup)

### First Time Setup
```bash
# 1. Backend setup (Terminal 1)
cd backend-ai
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python generate_dataset.py
python setup_rag.py
python -m app.main

# 2. Frontend setup (Terminal 2)
cd client
npm install
npm run dev
```

**Note**: First run downloads models to cache:
- LLM: `~/.cache/gpt4all/` (~4GB, one-time)
- Embeddings: `~/.cache/torch/sentence_transformers/` (~90MB, one-time)

### Subsequent Runs
```bash
# Terminal 1 - Backend (uses cached models!)
cd backend-ai
source venv/bin/activate
python -m app.main

# Terminal 2 - Frontend
cd client
npm run dev
```

---

## 📡 URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Main app |
| Backend API | http://localhost:8000 | API base |
| API Docs | http://localhost:8000/docs | Interactive docs |
| Welcome Page | http://localhost:5173/ | Landing |
| Dashboard | http://localhost:5173/dashboard | AI assistant |
| 3D Map | http://localhost:5173/map | Route visualization |

---

## 🧪 Quick Tests

### Backend Health Check
```bash
curl http://localhost:8000/
```

### AI Query Test
```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Can I reach Pune from Mumbai with 70% battery?",
    "user_id": "user_001",
    "include_map": false
  }'
```

### User Profile
```bash
curl http://localhost:8000/api/user/user_001/profile
```

### Global Stats
```bash
curl http://localhost:8000/api/stats/global
```

---

## 🎯 Sample Queries

Copy-paste these into the AI assistant at http://localhost:5173/dashboard:

```
Can I reach Goa from Mumbai with 75% battery?

How far can I go with 80% charge?

Plan route to Bangalore with charging stops

What's my driving efficiency compared to others?

Best route from Delhi to Jaipur avoiding tolls

How does weather affect my range?

Find charging stations near Mumbai airport
```

---

## 📁 Project Structure (Key Files)

### Backend
```
backend-ai/
├── app/
│   ├── main.py              # FastAPI app entry
│   ├── api/
│   │   ├── ai_routes.py    # AI endpoints
│   │   └── routes.py       # Data endpoints
│   └── services/
│       ├── rag_service.py  # RAG queries
│       └── llm_service.py  # LLM processing
├── data/
│   ├── dataset_users.json  # 100 users
│   └── dataset_trips.json  # 2,917 trips
├── run.py                   # Start server
└── requirements.txt         # Dependencies
```

### Frontend
```
client/
├── src/
│   ├── components/
│   │   ├── FloatingNavbar.jsx     # Navigation
│   │   ├── AIQueryInterface.jsx   # AI chat
│   │   └── Map3D.jsx             # 3D map
│   ├── pages/
│   │   ├── Dashboard.jsx         # Main page
│   │   └── MapDemo.jsx          # Map demo
│   └── App.jsx                    # Routes
└── package.json                   # Dependencies
```

---

## 🔧 Common Commands

### Backend
```bash
# Activate environment
source venv/bin/activate

# Install/update dependencies
pip install -r requirements.txt

# Regenerate dataset
python generate_dataset.py

# Re-setup RAG (uses cached embedding model)
python setup_rag.py

# Start server (uses cached LLM)
python -m app.main

# Alternative start
uvicorn app.main:app --reload --port 8000

# Deactivate environment
deactivate
```

**Model Cache Locations:**
- LLM: `~/.cache/gpt4all/mistral-7b-instruct-v0.2.Q4_0.gguf`
- Embeddings: `~/.cache/torch/sentence_transformers/sentence-transformers_all-MiniLM-L6-v2`

### Frontend
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Clear cache
rm -rf node_modules package-lock.json
npm install
```

---

## 🐛 Troubleshooting Quick Fixes

### Backend Issues

**Port 8000 in use**
```bash
lsof -ti:8000 | xargs kill -9
python run.py
```

**ChromaDB errors**
```bash
rm -rf chroma_db/
python setup_rag.py
```

**Module not found**
```bash
source venv/bin/activate
pip install -r requirements.txt
```

**Out of memory**
```bash
# Edit .env
LLM_MAX_TOKENS=256  # Reduce from 512
```

### Frontend Issues

**Port 5173 in use**
```bash
# Vite auto-increments to 5174
# Or force different port:
npm run dev -- --port 3000
```

**Dependencies broken**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**3D map not loading**
- Check browser console (F12)
- Try Chrome/Firefox
- Check WebGL support: https://get.webgl.org/

---

## 📊 System Status Checks

### Check Backend
```bash
# Is server running?
curl http://localhost:8000/

# Check logs
# Look at terminal where 'python run.py' is running

# Check ChromaDB
ls -lh chroma_db/

# Check datasets
ls -lh data/
```

### Check Frontend
```bash
# Is server running?
curl http://localhost:5173/

# Check logs
# Look at browser console (F12)
# Or terminal where 'npm run dev' is running

# Check build
npm run build
```

---

## 🎨 UI Pages Overview

| Page | Path | Description |
|------|------|-------------|
| Welcome | `/` | Landing page with intro |
| Login | `/login` | Login form (demo) |
| Register | `/register` | Registration (demo) |
| Dashboard | `/dashboard` | AI query interface |
| AI Assistant | `/ai` | Same as dashboard |
| 3D Map | `/map` | Route visualization demo |
| Profile | `/profile` | User profile (future) |
| Analytics | `/analytics` | Stats dashboard (future) |

---

## 📚 Dataset Info

### Users (100 total)
- IDs: `user_001` to `user_100`
- Vehicles: Tata Nexon EV, MG ZS EV, Hyundai Kona, etc.
- Cities: Mumbai, Delhi, Bangalore, Chennai, Pune, etc.

### Trips (2,917 total)
- Average distance: ~428 km
- Total distance: 1.2M km
- Weather: sunny, cloudy, rainy, cold
- Traffic: light, moderate, heavy

### Sample User IDs for Testing
```
user_001
user_010
user_025
user_050
user_100
```

---

## 🔑 Environment Variables

### Backend (.env in backend-ai/)
```bash
# LLM
LLM_MODEL=mistral-7b-instruct-v0.2.Q4_0.gguf
LLM_MAX_TOKENS=512
LLM_TEMPERATURE=0.7

# RAG
CHROMA_PERSIST_DIRECTORY=./chroma_db
EMBEDDING_MODEL=all-MiniLM-L6-v2
TOP_K_GLOBAL=10
TOP_K_PERSONAL=5

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=true
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Data
DATASET_USERS_PATH=data/dataset_users.json
DATASET_TRIPS_PATH=data/dataset_trips.json
```

### Frontend (.env in client/)
```bash
VITE_API_URL=http://localhost:8000
```

---

## ⚡ Performance Tips

### Backend
- First query takes 10-15 seconds (LLM initialization)
- Subsequent queries: 3-6 seconds
- Close other apps if running slow
- 16GB RAM recommended for smooth operation

### Frontend
- Use Chrome/Firefox for best 3D performance
- Disable dev tools when not debugging
- Clear browser cache if slow

---

## 📦 Dependencies Summary

### Backend (Python)
```txt
fastapi
uvicorn
chromadb
sentence-transformers
gpt4all
pydantic-settings
python-dotenv
```

### Frontend (Node.js)
```json
{
  "react": "19.0.0",
  "three": "latest",
  "@react-three/fiber": "9.0.0",
  "@react-three/drei": "10.0.0",
  "framer-motion": "12.0.0",
  "zustand": "5.0.2",
  "tailwindcss": "4.0.0",
  "react-router-dom": "7.2.0"
}
```

---

## 🎯 API Endpoints Quick Reference

### AI Endpoints
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/query` | `{query, user_id, include_map}` | General AI query |
| POST | `/api/predict-range` | `{user_id, start, end, battery, weather}` | Range prediction |
| GET | `/api/user/{id}/analysis` | - | User performance analysis |
| GET | `/api/user/{id}/profile` | - | User profile & stats |

### Data Endpoints
| Method | Endpoint | Params | Description |
|--------|----------|--------|-------------|
| GET | `/api/routes/popular` | - | Most traveled routes |
| GET | `/api/stats/global` | - | Global trip statistics |
| GET | `/api/charging-stations/nearby` | `lat, lon, radius_km` | Nearby chargers |

---

## 💡 Tips & Best Practices

### Development
- Keep backend and frontend terminals separate
- Check both consoles for errors
- Use browser DevTools (F12) for debugging
- Test API in `/docs` before frontend integration

### Testing
- Start with simple queries
- Test one feature at a time
- Check network tab for API responses
- Verify data in `/docs` interface

### Deployment
- Build frontend: `npm run build`
- Set `DEBUG=False` in backend
- Use production WSGI server (Gunicorn)
- Configure CORS properly
- Add authentication

---

**Last Updated**: December 2024  
**Status**: ✅ Development Complete, ⏳ Testing Pending

**Quick Help**: 
- Issues? Check browser console & terminal logs
- API not responding? Check http://localhost:8000/docs
- Frontend blank? Check http://localhost:5173 in network tab
