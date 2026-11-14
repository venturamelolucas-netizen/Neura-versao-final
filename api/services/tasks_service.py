from typing import List, Dict, Any, Optional
from data.data_manager import carregar_dados, salvar_dados
import core.tarefas as core_tarefas

VALID_CHAVES = {"tarefas_diarias", "tarefas_educacionais"}

def listar_tarefas(usuario: str, chave: str) -> List[Dict[str, Any]]:
    if chave not in VALID_CHAVES:
        return []
    dados = carregar_dados()
    if usuario not in dados:
        return []
    tarefas = dados[usuario].get(chave, [])
    # Return with index for client ease
    return [
        {
            "id": idx,
            "titulo": t.get("titulo", ""),
            "concluida": t.get("concluida", False),
            "passos": t.get("passos", [])
        }
        for idx, t in enumerate(tarefas)
    ]

def criar_tarefa(usuario: str, chave: str, titulo: str) -> bool:
    if chave not in VALID_CHAVES or not titulo.strip():
        return False
    dados = carregar_dados()
    if usuario not in dados:
        return False
    core_tarefas.adicionar_tarefa(dados, usuario, chave, titulo.strip())
    return True

def alternar_status_tarefa(usuario: str, chave: str, idx: int) -> bool:
    if chave not in VALID_CHAVES:
        return False
    dados = carregar_dados()
    if usuario not in dados:
        return False
    tarefas = dados[usuario].get(chave, [])
    if 0 <= idx < len(tarefas):
        core_tarefas.alternar_status_tarefa(dados, usuario, chave, idx)
        return True
    return False

def alternar_status_passo(usuario: str, chave: str, idx: int, step_idx: int) -> bool:
    if chave not in VALID_CHAVES:
        return False
    dados = carregar_dados()
    if usuario not in dados:
        return False
    tarefas = dados[usuario].get(chave, [])
    if 0 <= idx < len(tarefas):
        passos = tarefas[idx].get("passos", [])
        if 0 <= step_idx < len(passos):
            passos[step_idx]["concluido"] = not passos[step_idx].get("concluido", False)
            salvar_dados(dados)
            return True
    return False

def injetar_passos(usuario: str, chave: str, idx: int, passos: List[str]) -> bool:
    if chave not in VALID_CHAVES:
        return False
    dados = carregar_dados()
    if usuario not in dados:
        return False
    tarefas = dados[usuario].get(chave, [])
    if 0 <= idx < len(tarefas):
        core_tarefas.injetar_passos_ia(dados, usuario, chave, idx, passos)
        return True
    return False

def excluir_tarefa(usuario: str, chave: str, idx: int) -> bool:
    if chave not in VALID_CHAVES:
        return False
    dados = carregar_dados()
    if usuario not in dados:
        return False
    tarefas = dados[usuario].get(chave, [])
    if 0 <= idx < len(tarefas):
        tarefas.pop(idx)
        salvar_dados(dados)
        return True
    return False
