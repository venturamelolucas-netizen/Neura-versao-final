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

# ▶️ Execução do Projeto

## 🚀 Como rodar o projeto (Front-end + Back-end)

Este guia contém o passo a passo completo para configurar e executar a aplicação localmente, incluindo soluções para os erros mais comuns de ambiente.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
* **Node.js** (versão 18 ou superior)
* **Python** (versão 3.10 ou superior)
* **Git**

---

## ⚙️ Passo 1: Configurar e iniciar o Back-end (Python / FastAPI)

O servidor da API precisa rodar na porta **8001** para se comunicar corretamente com o front-end.

1. Abra um terminal e entre na pasta da API:
   ```bash
   cd api
   ```

2. Instale as dependências listadas no `requirements.txt`:
   ```bash
   python -m pip install -r requirements.txt
   ```
   > **Nota:** Caso o `uvicorn` não venha no arquivo de requisitos, instale-o manualmente com: `python -m pip install "uvicorn[standard]"`

3. Inicie o servidor na porta **8001**:
   ```bash
   python -m uvicorn main:app --reload --port 8001
   ```
   > **Por que usar `python -m`?** No Windows, é comum o terminal não reconhecer o comando `uvicorn` diretamente por falta de configuração no `PATH`. Usar `python -m` resolve esse problema imediatamente.

4. Aguarde aparecer a mensagem: `Uvicorn running on http://127.0.0.1:8001`. **Não feche este terminal.**

---

## 💻 Passo 2: Configurar e iniciar o Front-end (Vite / React)

Com o terminal do back-end rodando em segundo plano, abra um **segundo terminal** na pasta principal (raiz) do projeto.

1. Instale as dependências do Node ignorando conflitos opcionais do Vite/esbuild:
   ```bash
   npm install --legacy-peer-deps
   ```
   > **Por que usar `--legacy-peer-deps`?** Evita o erro `ERESOLVE` causado por divergências entre versões secundárias do `esbuild` e do `vite`.

2. Inicie o servidor de desenvolvimento do front-end:
   ```bash
   npm run dev
   ```

3. Abra o navegador e acesse:
   👉 **`http://localhost:3000`**

---

## 🔑 Variáveis de Ambiente (`.env`)

Certifique-se de que existe um arquivo `.env` na raiz do projeto contendo a sua chave da API (como a chave da **Groq**) e a URL da API apontando para a porta `8001`. Caso sua chave pare de funcionar, gere uma nova no painel da Groq e substitua no arquivo `.env`.

---

## 🛠️ Solução de Problemas Comuns

* **Erro: `'vite' não é reconhecido como um comando...`**
  Você esqueceu de instalar as dependências antes de rodar o projeto. Execute `npm install --legacy-peer-deps` primeiro.
* **Erro: `'uvicorn' não é reconhecido como um comando...`**
  Execute o servidor chamando o módulo pelo Python: `python -m uvicorn main:app --reload --port 8001`.
* **Front-end abre, mas não carrega dados da IA/API:**
  Verifique se o primeiro terminal (back-end) está aberto e rodando exatamente na porta **8001** (`--port 8001`).
