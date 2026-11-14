from pydantic import BaseModel
from typing import List, Optional

class PassoSchema(BaseModel):
    texto: str
    concluido: bool = False

class TarefaSchema(BaseModel):
    titulo: str
    concluida: bool = False
    passos: List[PassoSchema] = []

class CriarTarefaRequest(BaseModel):
    titulo: str

class InjetarPassosRequest(BaseModel):
    passos: List[str]
