import os
import sys

# Garante que o diretório raiz esteja no PYTHONPATH para importar core, data, ui
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from api.routers import auth, tasks, neura, agenda, shopping

app = FastAPI(
    title="Neuro App API",
    description="Camada de integração HTTP para o Neuro App conectando o front-end web às funções do backend Python original.",
    version="1.0.0"
)

# Origens permitidas explícitas com suporte a variável de ambiente APP_URL
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app_url = os.getenv("APP_URL", "").strip().rstrip("/")
if app_url and app_url not in allowed_origins:
    allowed_origins.append(app_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Registro dos routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(neura.router)
app.include_router(agenda.router)
app.include_router(shopping.router)

@app.get("/api/health")
def health():
    return {
        "status": "online",
        "app": "Neuro App API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8001, reload=True)
