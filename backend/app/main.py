from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from app.search_logic import executar_pesquisa_documentos

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    diretorio: str
    documentos: List[str]
    validar_fpl: bool = False

@app.post("/buscar")
async def buscar_docs(data: SearchRequest):
    logs = []
    
    def registrar_log(msg):
        logs.append(msg.strip())
    
    try:
        executar_pesquisa_documentos(
            diretorio_atual=data.diretorio,
            validar_fpl=data.validar_fpl,
            documentos=data.documentos,
            log_callback=registrar_log
        )
        
        return {"logs": logs}
    except Exception as e:
        return {"logs": [f"Erro: {str(e)}"]}

# Endpoint de teste
@app.get("/")
async def root():
    return {"message": "Backend funcionando!"}