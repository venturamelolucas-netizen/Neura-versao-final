from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from api.schemas.shopping import CriarListaComprasRequest, AdicionarItemRequest
from api.services.shopping_service import (
    obter_lista,
    criar_lista,
    adicionar_item,
    alternar_item,
    reaproveitar_lista,
    excluir_lista
)
from api.routers.deps import get_current_user

router = APIRouter(prefix="/api/shopping", tags=["Lista de Compras"])

@router.get("")
def get_shopping_list(current_user: str = Depends(get_current_user)):
    return obter_lista()

@router.post("")
def post_criar_lista(req: CriarListaComprasRequest, current_user: str = Depends(get_current_user)):
    return criar_lista(req.itens)

@router.post("/item")
def post_adicionar_item(req: AdicionarItemRequest, current_user: str = Depends(get_current_user)):
    sucesso = adicionar_item(req.nome)
    if not sucesso:
        raise HTTPException(status_code=400, detail="Nome do item inválido.")
    return obter_lista()

@router.patch("/items/{idx}/toggle")
def patch_alternar_item(idx: int, current_user: str = Depends(get_current_user)):
    sucesso = alternar_item(idx)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Item não encontrado.")
    return obter_lista()

@router.post("/reuse")
def post_reaproveitar_lista(current_user: str = Depends(get_current_user)):
    sucesso = reaproveitar_lista()
    if not sucesso:
        raise HTTPException(status_code=404, detail="Nenhuma lista ativa para reaproveitar.")
    return obter_lista()

@router.delete("")
def delete_lista(current_user: str = Depends(get_current_user)):
    excluir_lista()
    return {"itens": []}
