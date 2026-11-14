from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from api.schemas.agenda import CriarCompromissoRequest
from api.services.agenda_service import (
    listar_compromissos,
    adicionar_compromisso,
    alternar_conclusao_compromisso,
    excluir_compromisso
)
from api.routers.deps import get_current_user

router = APIRouter(prefix="/api/agenda", tags=["Agenda"])

@router.get("")
def get_agenda(current_user: str = Depends(get_current_user)):
    return listar_compromissos()

@router.post("")
def post_compromisso(req: CriarCompromissoRequest, current_user: str = Depends(get_current_user)):
    sucesso, msg, ev = adicionar_compromisso(req.titulo, req.data, req.hora)
    if not sucesso:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
    return listar_compromissos()

@router.patch("/{idx}/toggle")
def toggle_compromisso(idx: int, current_user: str = Depends(get_current_user)):
    sucesso = alternar_conclusao_compromisso(idx)
    if not sucesso:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compromisso não encontrado.")
    return listar_compromissos()

@router.delete("/{idx}")
def delete_compromisso(idx: int, current_user: str = Depends(get_current_user)):
    sucesso = excluir_compromisso(idx)
    if not sucesso:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compromisso não encontrado.")
    return listar_compromissos()
