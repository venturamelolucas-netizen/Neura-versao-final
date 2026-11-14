# Neuro App — Camada de Integração HTTP (FastAPI)

Esta camada fornece endpoints REST que funcionam como ponte entre o front-end React e as funções Python originais do Neuro App, preservando integralmente todas as regras de negócio, a persistência JSON e as integrações originais.

## Estrutura da Camada

```text
api/
├── main.py                  # Ponto de entrada FastAPI, middlewares e CORS
├── routers/                 # Roteadores REST divididos por domínio
│   ├── auth.py              # Cadastro, login, logout e sessão
│   ├── tasks.py             # Tarefas diárias e educacionais, microtarefas
│   ├── neura.py             # Conversas com NEURA e quebra guiada de tarefas
│   ├── agenda.py            # Planner e compromissos
│   └── shopping.py          # Lista global de compras
├── schemas/                 # Validações e modelos com Pydantic
│   ├── auth.py
│   ├── tasks.py
│   ├── neura.py
│   ├── agenda.py
│   └── shopping.py
├── services/                # Adaptadores finos que invocam as funções originais
│   ├── auth_service.py      # Reutiliza carregar_dados, salvar_dados, validar_email/senha
│   ├── tasks_service.py     # Reutiliza core.tarefas (adicionar, alternar, injetar)
│   ├── neura_service.py     # Reutiliza core.ia_service (obter_responder_ia, gerar_passos_tarefa)
│   ├── agenda_service.py    # Reutiliza core.agenda (carregar_agenda, salvar_agenda)
│   └── shopping_service.py  # Reutiliza core.lista_compras (carregar_lista, salvar_lista)
├── requirements.txt         # Dependências da API
└── README.md
```

## Endpoints Disponíveis

### Autenticação
- `POST /api/auth/register` — Cadastro de novo perfil com validação e preferências
- `POST /api/auth/login` — Autenticação por e-mail ou WhatsApp + senha
- `POST /api/auth/logout` — Encerramento de sessão
- `GET /api/auth/me` — Consulta do perfil autenticado

### Tarefas
- `GET /api/tasks/{chave}` — Lista tarefas (`tarefas_diarias` ou `tarefas_educacionais`)
- `POST /api/tasks/{chave}` — Cria uma nova tarefa
- `PATCH /api/tasks/{chave}/{idx}/toggle` — Alterna status concluído da tarefa
- `PATCH /api/tasks/{chave}/{idx}/steps/{step_idx}/toggle` — Alterna status da microtarefa
- `POST /api/tasks/{chave}/{idx}/inject-steps` — Salva passos gerados pela NEURA
- `DELETE /api/tasks/{chave}/{idx}` — Remove a tarefa

### NEURA (IA)
- `POST /api/neura/chat` — Envio de mensagem com preservação do estilo
- `POST /api/neura/breakdown` — Fluxo interativo de divisão em microtarefas

### Agenda
- `GET /api/agenda` — Lista compromissos cronologicamente
- `POST /api/agenda` — Cadastra novo compromisso com validação DD/MM/AAAA e HH:MM
- `PATCH /api/agenda/{idx}/toggle` — Alterna status do compromisso
- `DELETE /api/agenda/{idx}` — Exclui compromisso

### Lista de Compras
- `GET /api/shopping` — Consulta itens da lista global
- `POST /api/shopping` — Cria lista com múltiplos itens
- `POST /api/shopping/item` — Adiciona item à lista
- `PATCH /api/shopping/items/{idx}/toggle` — Alterna item comprado
- `POST /api/shopping/reuse` — Reinicia itens para nova compra
- `DELETE /api/shopping` — Remove lista salva
