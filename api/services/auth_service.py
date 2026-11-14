import secrets
from typing import Optional, Tuple, Dict, Any
from data.data_manager import carregar_dados, salvar_dados
from api.services.validators import validar_email, validar_whatsapp, validar_senha

# In-memory session store mapping session_token -> username
_SESSIONS: Dict[str, str] = {}

def criar_sessao(usuario: str) -> str:
    token = secrets.token_urlsafe(32)
    _SESSIONS[token] = usuario
    return token

def obter_usuario_da_sessao(token: Optional[str]) -> Optional[str]:
    if not token:
        return None
    return _SESSIONS.get(token)

def remover_sessao(token: Optional[str]) -> None:
    if token and token in _SESSIONS:
        del _SESSIONS[token]

def registrar_usuario(nome: str, contato: str, senha: str, estilo_instrucao: str = "direto") -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    nome = nome.strip().lower()
    contato = contato.strip().lower()
    senha = senha.strip()

    if not nome:
        return False, "Nome obrigatório.", None

    if not contato:
        return False, "Email ou WhatsApp obrigatório.", None

    dados = carregar_dados()

    # Impede sobrescrita de usuário existente com mesmo nome
    if nome in dados:
        return False, "Esse nome de usuário já está cadastrado. Por favor, escolha outro nome.", None

    # Verifica se já existe contato cadastrado
    for usuario, info in dados.items():
        if info.get("email") == contato or info.get("whatsapp") == contato:
            return False, "Esse contato já está cadastrado.", None

    if "@" in contato:
        if not validar_email(contato):
            return False, "Email inválido.", None
        email = contato
        whatsapp = ""
    else:
        if not validar_whatsapp(contato):
            return False, "WhatsApp inválido.", None
        whatsapp = contato
        email = ""

    senha_ok, erro_senha = validar_senha(senha)
    if not senha_ok:
        return False, erro_senha, None

    estilo = "direto" if estilo_instrucao == "direto" else "detalhado"

    dados[nome] = {
        "email": email,
        "whatsapp": whatsapp,
        "senha": senha,
        "preferencias": {
            "estilo_instrucao": estilo
        },
        "tarefas_diarias": [],
        "tarefas_educacionais": []
    }

    salvar_dados(dados)

    user_info = {
        "nome": nome,
        "email": email,
        "whatsapp": whatsapp,
        "preferencias": {"estilo_instrucao": estilo},
        "tarefas_diarias": [],
        "tarefas_educacionais": []
    }
    return True, "Perfil criado com sucesso!", user_info

def autenticar_usuario(contato: str, senha: str) -> Tuple[bool, str, Optional[str], Optional[Dict[str, Any]]]:
    contato = contato.strip().lower()
    senha = senha.strip()

    dados = carregar_dados()
    usuario_encontrado = None

    for usuario, info in dados.items():
        if info.get("email") == contato or info.get("whatsapp") == contato:
            usuario_encontrado = usuario
            break

    if usuario_encontrado is None:
        return False, "Esse login não está cadastrado.", None, None

    if senha != dados[usuario_encontrado].get("senha"):
        return False, "Senha incorreta.", None, None

    info = dados[usuario_encontrado]
    user_info = {
        "nome": usuario_encontrado,
        "email": info.get("email", ""),
        "whatsapp": info.get("whatsapp", ""),
        "preferencias": info.get("preferencias", {"estilo_instrucao": "direto"}),
        "tarefas_diarias": info.get("tarefas_diarias", []),
        "tarefas_educacionais": info.get("tarefas_educacionais", [])
    }
    return True, "Login realizado com sucesso!", usuario_encontrado, user_info

def obter_perfil_usuario(usuario: str) -> Optional[Dict[str, Any]]:
    dados = carregar_dados()
    if usuario not in dados:
        return None
    info = dados[usuario]
    return {
        "nome": usuario,
        "email": info.get("email", ""),
        "whatsapp": info.get("whatsapp", ""),
        "preferencias": info.get("preferencias", {"estilo_instrucao": "direto"}),
        "tarefas_diarias": info.get("tarefas_diarias", []),
        "tarefas_educacionais": info.get("tarefas_educacionais", [])
    }
