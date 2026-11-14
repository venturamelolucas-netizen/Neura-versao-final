from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class PreferenciasSchema(BaseModel):
    estilo_instrucao: str = Field(default="direto", description="'direto' ou 'detalhado'")

class RegistroRequest(BaseModel):
    nome: str
    contato: str
    senha: str
    preferencias: Optional[PreferenciasSchema] = None

class LoginRequest(BaseModel):
    contato: str
    senha: str

class UsuarioResponse(BaseModel):
    nome: str
    email: str
    whatsapp: str
    preferencias: Dict[str, Any]
    tarefas_diarias: List[Dict[str, Any]]
    tarefas_educacionais: List[Dict[str, Any]]
