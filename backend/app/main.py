from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
from app.search_logic import executar_pesquisa_documentos
from app.excel_export import criar_relatorio
import tempfile
import os

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

class ExportRequest(BaseModel):
    documentos_encontrados: List[List[str]]
    documentos_nao_encontrados: List[str]
    qtde_arquivos_pesquisados: int
    nome_arquivo: str

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
    
@app.post("/exportar")
async def exportar_excel(data: ExportRequest):
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            caminho_relatorio = criar_relatorio(
                documentos_encontrados=data.documentos_encontrados,
                documentos_nao_encontrados=data.documentos_nao_encontrados,
                qtde_arquivos_pesquisados=data.qtde_arquivos_pesquisados,
                nome_arquivo=data.nome_arquivo,
                diretorio_atual=temp_dir
            )

            caminho_completo = os.path.join(temp_dir, caminho_relatorio)

            return FileResponse(
                path=caminho_completo,
                filename=data.nome_arquivo,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
    except Exception as e:
        return {"error": f"Erro ao exportar o relatório: {str(e)}"}

# Endpoint de teste
@app.get("/")
async def root():
    return {"message": "Backend funcionando!"}