# 🧠 Neuro App — Organização e Produtividade com IA (NEURA)

O **Neuro App** é uma aplicação web focada em organização pessoal, combate à procrastinação e apoio à execução de tarefas (com atenção especial a pessoas com TDA/TDAH).

O sistema conta com a **NEURA**, uma assistente de inteligência artificial projetada para reduzir a sobrecarga mental, transformar metas grandes em microtarefas de 5 a 30 minutos e guiar o usuário por meio de sessões de foco com Timer Pomodoro.

---

## ✨ Funcionalidades Principais

* **Desmembramento Inteligente de Tarefas:** A NEURA analisa tarefas vagas, faz perguntas rápidas de direcionamento e gera de 3 a 6 microtarefas acionáveis prontas para serem salvas.
* **Assistente de Produtividade (Chat NEURA):** Auxilia no planejamento de estudos, concursos, organização doméstica, listas de compras e organização básica de contas/boletos.
* **Gestão de Tarefas:** Separação entre tarefas diárias e tarefas educacionais, com acompanhamento de conclusão.
* **Timer Pomodoro Integrado:** Ciclos fixos de **25 minutos de foco** e **5 minutos de pausa** para facilitar o início e a manutenção das atividades.
* **Dashboard, Agenda e Compras:** Visualização geral de progresso, organização de compromissos e listas de mercado categorizadas.

---

## 🛠️ Tecnologias e Dependências

### Frontend
* **React** + **TypeScript**
* **Vite** (servidor de desenvolvimento e empacotamento)
* **Tailwind CSS** (estilização)
* **Lucide React** (`lucide-react` — ícones da interface)
* **Canvas Confetti** (`canvas-confetti` — feedback visual ao concluir etapas)

### Backend & Inteligência Artificial
* **Python 3.10+**
* **FastAPI** & **Uvicorn** (`fastapi`, `uvicorn` — servidor web/API que conecta o backend ao frontend na porta `8001`)
* **Groq Python SDK** (`groq` — integração com o modelo `openai/gpt-oss-120b` e rotação automática de chaves)
* **Python Dotenv** (`python-dotenv` — carregamento de variáveis de ambiente)

---

## 📋 Pré-requisitos

Antes de instalar e rodar o projeto, certifique-se de ter em sua máquina:
* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* [Python](https://www.python.org/) (versão 3.10 ou superior)
* Uma ou mais chaves de API da [Groq Cloud](https://console.groq.com/)

---

## 🚀 Instalação e Configuração

### 1. Clonar o repositório
```bash
git clone [https://github.com/lucasmelo-lvm/Neura.git](https://github.com/lucasmelo-lvm/Neura.git)
cd Neura
```

### 2. Configurar as variáveis de ambiente
Crie um arquivo chamado `.env` na raiz do projeto (ou dentro da pasta `api/`, conforme a estrutura local) e adicione sua(s) chave(s) da API da Groq separadas por vírgula:
```env
GROQ_API_KEYS=gsk_sua_chave_aqui_1,gsk_sua_chave_aqui_2
```

### 3. Instalar as dependências do Backend (Python)
Na raiz do projeto, crie um ambiente virtual (opcional, mas recomendado) e instale os pacotes necessários:
```bash
# Criar e ativar ambiente virtual (Windows)
python -m venv venv
venv\Scripts\activate

# Instalar dependências da API e da IA
pip install fastapi uvicorn groq python-dotenv
```
*(Caso o projeto possua um arquivo `requirements.txt`, instale tudo de uma vez com `pip install -r requirements.txt`.)*

### 4. Instalar as dependências do Frontend (Node.js)
Na raiz do projeto (onde está o arquivo `package.json`), instale os pacotes do React/Vite:
```bash
npm install
```

---

## ▶️ Execução do Projeto

Para conectar o frontend ao backend e rodar o sistema completo, mantenha os **dois servidores ativos simultaneamente** em terminais separados:

### Passo 1 — Iniciar o Backend na porta 8001 (API da NEURA)
No primeiro terminal (com o ambiente virtual Python ativado), entre na pasta `api` e inicie o servidor Uvicorn na porta `8001`:
```bash
cd ./api/
uvicorn main:app --reload --port 8001
```

### Passo 2 — Iniciar o Frontend (Interface Web)
Abra um segundo terminal na raiz do projeto e inicie o servidor do Vite:
```bash
npm run dev
```

### Passo 3 — Acessar a Aplicação
Com o backend rodando em `http://localhost:8001` e o frontend ativo, abra o navegador e acesse:
```text
http://localhost:5173
```

---

## 📦 Build para Produção (Opcional)

Caso queira gerar os arquivos estáticos otimizados do frontend para deploy:
```bash
npm run build
```
