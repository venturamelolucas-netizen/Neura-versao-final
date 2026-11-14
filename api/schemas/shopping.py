from pydantic import BaseModel
from typing import List

class ItemCompraSchema(BaseModel):
    nome: str
    comprado: bool = False

class ListaComprasSchema(BaseModel):
    itens: List[ItemCompraSchema] = []

class CriarListaComprasRequest(BaseModel):
    itens: List[str]

class AdicionarItemRequest(BaseModel):
    nome: str
