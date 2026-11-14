from fastapi import APIRouter, Response, HTTPException, status, Depends
from api.schemas.auth import RegistroRequest, LoginRequest, UsuarioResponse
from api.services.auth_service import (
    registrar_usuario,
    autenticar_usuario,
    criar_sessao,
    remover_sessao,
    obter_perfil_usuario
)
from api.routers.deps import get_current_user, get_current_token
from typing import Optional

router = APIRouter(prefix="/api/auth", tags=["Autenticação"])

@router.post("/register")
def registrar(req: RegistroRequest, response: Response):
    estilo = req.preferencias.estilo_instrucao if req.preferencias else "direto"
    sucesso, msg, user_data = registrar_usuario(req.nome, req.contato, req.senha, estilo)
    if not sucesso:
        status_code = status.HTTP_409_CONFLICT if "já está cadastrado" in msg else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code, detail=msg)

    token = criar_sessao(user_data["nome"])
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=60*60*24*7
    )
    return {
        "mensagem": msg,
        "token": token,
        "usuario": user_data
    }

@router.post("/login")
def login(req: LoginRequest, response: Response):
    sucesso, msg, nome_usuario, user_data = autenticar_usuario(req.contato, req.senha)
    if not sucesso:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=msg)

    token = criar_sessao(nome_usuario)
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=60*60*24*7
    )
    return {
        "mensagem": msg,
        "token": token,
        "usuario": user_data
    }

@router.post("/logout")
def logout(response: Response, token: Optional[str] = Depends(get_current_token)):
    if token:
        remover_sessao(token)
    response.delete_cookie("session_token")
    return {"mensagem": "Logout realizado com sucesso."}

@router.get("/me")
def obter_usuario_logado(current_user: str = Depends(get_current_user)):
    perfil = obter_perfil_usuario(current_user)
    if not perfil:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")
    return perfil
