from fastapi import Header, Cookie, HTTPException, status
from typing import Optional
from api.services.auth_service import obter_usuario_da_sessao

def get_current_token(
    authorization: Optional[str] = Header(None),
    x_session_token: Optional[str] = Header(None),
    session_token: Optional[str] = Cookie(None)
) -> Optional[str]:
    if authorization and authorization.startswith("Bearer "):
        return authorization.split(" ")[1]
    if x_session_token:
        return x_session_token
    if session_token:
        return session_token
    return None

def get_current_user(
    authorization: Optional[str] = Header(None),
    x_session_token: Optional[str] = Header(None),
    session_token: Optional[str] = Cookie(None)
) -> str:
    token = get_current_token(authorization, x_session_token, session_token)
    usuario = obter_usuario_da_sessao(token)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não autenticado. Por favor, faça login."
        )
    return usuario
