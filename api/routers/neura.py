from fastapi import APIRouter, Depends, HTTPException
from api.schemas.neura import (
    ChatRequest,
    ChatResponse,
    DesmembrarTarefaRequest,
    DesmembrarTarefaResponse
)
from api.services.neura_service import conversar_com_neura, desmembrar_tarefa_interativo
from api.services.auth_service import obter_perfil_usuario
from api.routers.deps import get_current_user

router = APIRouter(prefix="/api/neura", tags=["NEURA Assistente"])

@router.post("/chat", response_model=ChatResponse)
def chat_neura(req: ChatRequest, current_user: str = Depends(get_current_user)):
    perfil = obter_perfil_usuario(current_user)
    estilo = "direto"
    if perfil and "preferencias" in perfil:
        estilo = perfil["preferencias"].get("estilo_instrucao", "direto")
    if req.estilo:
        estilo = req.estilo

    linhas = conversar_com_neura(req.pergunta, estilo)
    return ChatResponse(
        resposta=linhas,
        resposta_texto="\n".join(linhas)
    )

@router.post("/breakdown", response_model=DesmembrarTarefaResponse)
def breakdown_tarefa(req: DesmembrarTarefaRequest, current_user: str = Depends(get_current_user)):
    historico_dicts = [{"role": m.role, "content": m.content} for m in req.historico]
    linhas, gerou_passos, tentativas, passos_sugeridos, historico_atualizado = desmembrar_tarefa_interativo(
        tarefa_titulo=req.tarefa_titulo,
        historico=historico_dicts,
        resposta_usuario=req.resposta_usuario,
        tentativas=req.tentativas,
        solicitar_geracao_imediata=bool(req.solicitar_geracao_imediata)
    )
    return DesmembrarTarefaResponse(
        linhas=linhas,
        gerou_passos=gerou_passos,
        tentativas=tentativas,
        passos_sugeridos=passos_sugeridos,
        historico_atualizado=historico_atualizado
    )
