import re
from typing import Tuple

def validar_email(email: str):
    padrao = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(padrao, email)

def validar_whatsapp(numero: str) -> bool:
    numero = numero.replace(" ", "")
    numero = numero.replace("-", "")
    return numero.isdigit() and len(numero) >= 10

def validar_senha(senha: str) -> Tuple[bool, str]:
    if len(senha) < 6:
        return False, "A senha precisa ter no mínimo 6 caracteres."

    if not any(c.isalpha() for c in senha):
        return False, "A senha precisa conter uma letra."

    if not any(c.isdigit() for c in senha):
        return False, "A senha precisa conter um número."

    return True, ""
