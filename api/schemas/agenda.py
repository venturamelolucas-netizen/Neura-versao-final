from pydantic import BaseModel

class CompromissoSchema(BaseModel):
    titulo: str
    data: str
    hora: str
    feito: bool = False

class CriarCompromissoRequest(BaseModel):
    titulo: str
    data: str
    hora: str
