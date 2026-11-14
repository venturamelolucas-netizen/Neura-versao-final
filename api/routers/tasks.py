from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Any
from api.schemas.tasks import CriarTarefaRequest, InjetarPassosRequest
from api.services.tasks_service import (
    listar_tarefas,
    criar_tarefa,
    alternar_status_tarefa,
    alternar_status_passo,
    injetar_passos,
    excluir_tarefa
)
from api.routers.deps import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Tarefas"])

@router.get("/{chave}")
def get_tarefas(chave: str, current_user: str = Depends(get_current_user)):
    if chave not in ("tarefas_diarias", "tarefas_educacionais"):
        raise HTTPException(status_code=400, detail="Chave de tarefas inválida.")
    return listar_tarefas(current_user, chave)

@router.post("/{chave}")
def post_tarefa(chave: str, req: CriarTarefaRequest, current_user: str = Depends(get_current_user)):
    sucesso = criar_tarefa(current_user, chave, req.titulo)
    if not sucesso:
        raise HTTPException(status_code=400, detail="Não foi possível criar a tarefa.")
    return listar_tarefas(current_user, chave)

@router.patch("/{chave}/{idx}/toggle")
def toggle_tarefa(chave: str, idx: int, current_user: str = Depends(get_current_user)):
    sucesso = alternar_status_tarefa(current_user, chave, idx)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
    return listar_tarefas(current_user, chave)

@router.patch("/{chave}/{idx}/steps/{step_idx}/toggle")
def toggle_passo(chave: str, idx: int, step_idx: int, current_user: str = Depends(get_current_user)):
    sucesso = alternar_status_passo(current_user, chave, idx, step_idx)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Passo não encontrado.")
    return listar_tarefas(current_user, chave)

@router.post("/{chave}/{idx}/inject-steps")
def injetar_passos_tarefa(chave: str, idx: int, req: InjetarPassosRequest, current_user: str = Depends(get_current_user)):
    sucesso = injetar_passos(current_user, chave, idx, req.passos)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
    return listar_tarefas(current_user, chave)

@router.delete("/{chave}/{idx}")
def delete_tarefa(chave: str, idx: int, current_user: str = Depends(get_current_user)):
    sucesso = excluir_tarefa(current_user, chave, idx)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
    return listar_tarefas(current_user, chave)
