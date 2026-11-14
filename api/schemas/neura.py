from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ChatRequest(BaseModel):
    pergunta: str
    estilo: Optional[str] = "direto"

class ChatResponse(BaseModel):
    resposta: List[str]
    resposta_texto: str

class MensagemHistorico(BaseModel):
    role: str
    content: str

class DesmembrarTarefaRequest(BaseModel):
    tarefa_titulo: str
    historico: List[MensagemHistorico] = []
    resposta_usuario: Optional[str] = None
    tentativas: int = 1
    solicitar_geracao_imediata: Optional[bool] = False

class DesmembrarTarefaResponse(BaseModel):
    linhas: List[str]
    gerou_passos: bool
    tentativas: int
    passos_sugeridos: List[str]
    historico_atualizado: List[Dict[str, str]]
