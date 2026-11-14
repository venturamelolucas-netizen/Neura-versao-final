import re
from typing import List, Dict, Any, Tuple
import core.ia_service as ia_service

# Verbos de ação comuns em português no início de microtarefas
VERBOS_ACAO = (
    "separar", "organizar", "limpar", "revisar", "estudar", "ler", "fazer",
    "resolver", "escrever", "criar", "abrir", "listar", "anotar", "guardar",
    "executar", "preparar", "comprar", "enviar", "verificar", "consultar",
    "definir", "praticar", "assistir", "resumir", "jogar", "varrer", "pagar"
)

def validar_historico(historico: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """Garante que apenas mensagens válidas com roles 'user' ou 'assistant' sejam repassadas."""
    historico_limpo = []
    for msg in historico:
        if isinstance(msg, dict) and "content" in msg:
            role = "assistant" if msg.get("role") == "assistant" else "user"
            conteudo = str(msg["content"]).strip()
            if conteudo:
                historico_limpo.append({"role": role, "content": conteudo})
    return historico_limpo

def eh_microtarefa(linha: str) -> bool:
    """Verifica se uma linha de texto representa uma microtarefa concreta de ação."""
    l = linha.strip()
    if not l or l.endswith("?"):
        return False

    # Marcadores explícitos de checklist
    if l.startswith(('☐', '[ ]', '- ☐', '• ☐', '* ☐')):
        return True

    # Padrão como: "1. Estudar capítulo...", "1) Separar..."
    match_num = re.match(r'^\d+[\.\)]\s*(.+)$', l)
    if match_num:
        texto = match_num.group(1).strip()
        # Se a frase numerada termina com '?', é pergunta, NÃO microtarefa
        if texto.endswith("?"):
            return False
        primeira_palavra = texto.split()[0].lower() if texto.split() else ""
        if primeira_palavra.startswith(VERBOS_ACAO):
            return True

    return False

def extrair_passo_limpo(linha: str) -> str:
    """Remove marcadores, caixas e numeração mantendo o texto puro da ação."""
    l = linha.strip()
    # Remove caixas de seleção
    l = re.sub(r'^(?:☐|\[\s*\]|-|•|\*|\d+[\.\)])\s*', '', l)
    l = re.sub(r'^(?:☐|\[\s*\])\s*', '', l)
    return l.strip()

def conversar_com_neura(pergunta: str, estilo: str = "direto") -> List[str]:
    respostas = ia_service.obter_responder_ia(pergunta, estilo)
    # Verifica se a Groq não possui chaves no ambiente
    if len(respostas) == 1 and ("Nenhuma chave de API" in respostas[0] or "Erro:" in respostas[0]):
        return [
            f"[NEURA - Assistente]: (Aviso: GROQ_API_KEYS não configurada no servidor)",
            f"Recebi seu pedido: '{pergunta}'.",
            "Para uma rotina organizada e focada no estilo " + estilo.upper() + ":",
            "1. Escolha a menor ação necessária para dar o primeiro passo agora.",
            "2. Elimine distrações do seu ambiente nos próximos 25 minutos.",
            "3. Ative o Timer Pomodoro do Neuro App para manter ritmo consistente.",
            "💡 Para respostas dinâmicas com LLaMA 3.3 70B, configure GROQ_API_KEYS no arquivo .env."
        ]
    return respostas

def desmembrar_tarefa_interativo(
    tarefa_titulo: str,
    historico: List[Dict[str, str]],
    resposta_usuario: str = None,
    tentativas: int = 1,
    solicitar_geracao_imediata: bool = False
) -> Tuple[List[str], bool, int, List[str], List[Dict[str, str]]]:
    max_tentativas = 3

    # Valida e higieniza papéis do histórico
    chat_hist = validar_historico(historico)
    if not chat_hist:
        chat_hist = [{"role": "user", "content": f"Quero desmembrar a tarefa: '{tarefa_titulo}'"}]

    # Se o usuário respondeu à pergunta ou solicitou geração imediata
    if resposta_usuario and resposta_usuario.strip():
        chat_hist.append({"role": "user", "content": resposta_usuario.strip()})
        tentativas += 1
    elif solicitar_geracao_imediata:
        chat_hist.append({"role": "user", "content": "Por favor, monte o plano com as microtarefas agora com base no que conversamos."})
        tentativas += 1

    # Executa a geração usando a função do backend
    linhas_resposta = ia_service.gerar_passos_tarefa(chat_hist)

    # Identifica ausência de chave de API da Groq
    falha_chave = any("Nenhuma chave" in l or "Erro: Nenhuma" in l for l in linhas_resposta)
    if falha_chave:
        if tentativas < 2 and not resposta_usuario and not solicitar_geracao_imediata:
            linhas_resposta = [
                f"(Modo Local da NEURA — configure GROQ_API_KEYS para ativar LLaMA 3.3)",
                f"Para montarmos o melhor plano para '{tarefa_titulo}':",
                "1. Qual é o objetivo específico ou entrega final?",
                "2. Quanto tempo disponível você tem para a primeira sessão?"
            ]
            gerou_passos = False
        else:
            linhas_resposta = [
                f"Aqui está o plano de microtarefas para '{tarefa_titulo}':",
                "☐ Separar o material e preparar o ambiente (5 min)",
                "☐ Executar a primeira etapa da meta sem distrações (15 min)",
                "☐ Pausar 5 minutos para oxigenar o cérebro",
                "☐ Revisar a execução e organizar os próximos passos (10 min)",
                "💡 Inicie o Timer de Foco do Neuro App para começar agora!"
            ]
            gerou_passos = True
    else:
        # Critério rigoroso: tem microtarefas reais E não é apenas uma lista de perguntas
        passos_detectados = [l for l in linhas_resposta if eh_microtarefa(l)]
        perguntas_detectadas = [l for l in linhas_resposta if l.strip().endswith("?")]

        # Se temos microtarefas reais e mais tarefas do que perguntas
        if len(passos_detectados) >= 2 and len(passos_detectados) >= len(perguntas_detectadas):
            gerou_passos = True
        elif tentativas >= max_tentativas:
            # Limite de interações atingido
            gerou_passos = True
        else:
            gerou_passos = False

    # Registra no histórico a resposta do assistente
    chat_hist.append({"role": "assistant", "content": "\n".join(linhas_resposta)})

    # Extrai passos finais utilizáveis
    passos_sugeridos: List[str] = []
    if gerou_passos:
        for l in linhas_resposta:
            if eh_microtarefa(l):
                passo = extrair_passo_limpo(l)
                if passo and passo not in passos_sugeridos:
                    passos_sugeridos.append(passo)

        # Se atingiu limite mas passos não usavam marcadores
        if not passos_sugeridos and tentativas >= max_tentativas:
            for l in linhas_resposta:
                l_limpa = l.strip()
                if l_limpa and not l_limpa.endswith("?") and not l_limpa.startswith(("Para montarmos", "Aqui está", "💡", "⚠️")):
                    passo = extrair_passo_limpo(l_limpa)
                    if passo and len(passo) > 4 and passo not in passos_sugeridos:
                        passos_sugeridos.append(passo)

    return linhas_resposta, gerou_passos, tentativas, passos_sugeridos, chat_hist
