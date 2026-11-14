from typing import Optional, Dict, Any, List
import os
import core.lista_compras as shopping_core

def obter_lista() -> Optional[Dict[str, Any]]:
    lista = shopping_core.carregar_lista()
    if not lista:
        return {"itens": []}
    # Enriquecer com id/índice
    itens_com_id = []
    for idx, item in enumerate(lista.get("itens", [])):
        itens_com_id.append({
            "id": idx,
            "nome": item.get("nome", ""),
            "comprado": item.get("comprado", False)
        })
    return {"itens": itens_com_id}

def criar_lista(nomes_itens: List[str]) -> Dict[str, Any]:
    itens = [
        {"nome": nome.strip(), "comprado": False}
        for nome in nomes_itens
        if nome.strip()
    ]
    nova_lista = {"itens": itens}
    shopping_core.salvar_lista(nova_lista)
    return obter_lista()

def adicionar_item(nome: str) -> bool:
    if not nome.strip():
        return False
    lista = shopping_core.carregar_lista()
    if not lista:
        lista = {"itens": []}
    lista["itens"].append({"nome": nome.strip(), "comprado": False})
    shopping_core.salvar_lista(lista)
    return True

def alternar_item(idx: int) -> bool:
    lista = shopping_core.carregar_lista()
    if not lista or "itens" not in lista:
        return False
    itens = lista["itens"]
    if 0 <= idx < len(itens):
        itens[idx]["comprado"] = not itens[idx].get("comprado", False)
        shopping_core.salvar_lista(lista)
        return True
    return False

def reaproveitar_lista() -> bool:
    lista = shopping_core.carregar_lista()
    if not lista or "itens" not in lista:
        return False
    for item in lista["itens"]:
        item["comprado"] = False
    shopping_core.salvar_lista(lista)
    return True

def excluir_lista() -> bool:
    if os.path.exists(shopping_core.ARQUIVO_LISTA):
        os.remove(shopping_core.ARQUIVO_LISTA)
        return True
    return False
