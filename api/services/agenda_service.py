from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import core.agenda as agenda_core

def listar_compromissos() -> List[Dict[str, Any]]:
    agenda = agenda_core.carregar_agenda()
    # Adiciona índice original para facilitar manipulação
    resultado = []
    for idx, ev in enumerate(agenda):
        resultado.append({
            "id": idx,
            "titulo": ev.get("titulo", ""),
            "data": ev.get("data", ""),
            "hora": ev.get("hora", ""),
            "feito": ev.get("feito", False)
        })
    def chave_ordenacao(item):
        try:
            return datetime.strptime(f"{item['data']} {item['hora']}", "%d/%m/%Y %H:%M")
        except Exception:
            return datetime.max

    resultado.sort(key=chave_ordenacao)
    return resultado

def adicionar_compromisso(titulo: str, data: str, hora: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    titulo = titulo.strip()
    data = data.strip()
    hora = hora.strip()

    if not titulo:
        return False, "Nome do compromisso obrigatório.", None

    try:
        datetime.strptime(data + " " + hora, "%d/%m/%Y %H:%M")
    except Exception:
        return False, "Data ou hora inválida. Use DD/MM/AAAA e HH:MM.", None

    agenda = agenda_core.carregar_agenda()
    novo_evento = {
        "titulo": titulo,
        "data": data,
        "hora": hora,
        "feito": False
    }
    agenda.append(novo_evento)
    agenda_core.salvar_agenda(agenda)

    novo_evento["id"] = len(agenda) - 1
    return True, "Compromisso salvo!", novo_evento

def alternar_conclusao_compromisso(idx: int) -> bool:
    agenda = agenda_core.carregar_agenda()
    if 0 <= idx < len(agenda):
        agenda[idx]["feito"] = not agenda[idx].get("feito", False)
        agenda_core.salvar_agenda(agenda)
        return True
    return False

def excluir_compromisso(idx: int) -> bool:
    agenda = agenda_core.carregar_agenda()
    if 0 <= idx < len(agenda):
        agenda.pop(idx)
        agenda_core.salvar_agenda(agenda)
        return True
    return False
