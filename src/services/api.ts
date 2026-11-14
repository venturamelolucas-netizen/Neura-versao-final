import { User, Task, AgendaEvent, ShoppingList } from '../types';

const API_BASE = '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('neuro_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('neuro_token', token);
    } else {
      localStorage.removeItem('neuro_token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
      headers.set('X-Session-Token', this.token);
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include'
    });

    if (!res.ok) {
      let errorMsg = 'Erro na requisição';
      try {
        const errorData = await res.json();
        errorMsg = errorData.detail || errorData.message || errorMsg;
      } catch {
        // ignore parse error
      }
      throw new Error(errorMsg);
    }

    return res.json();
  }

  // Auth
  async login(contato: string, senha: string): Promise<{ token: string; usuario: User; mensagem: string }> {
    const data = await this.request<{ token: string; usuario: User; mensagem: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ contato, senha })
    });
    this.setToken(data.token);
    return data;
  }

  async register(
    nome: string,
    contato: string,
    senha: string,
    estilo_instrucao: 'direto' | 'detalhado' = 'direto'
  ): Promise<{ token: string; usuario: User; mensagem: string }> {
    const data = await this.request<{ token: string; usuario: User; mensagem: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        nome,
        contato,
        senha,
        preferencias: { estilo_instrucao }
      })
    });
    this.setToken(data.token);
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Tasks
  async getTasks(chave: 'tarefas_diarias' | 'tarefas_educacionais'): Promise<Task[]> {
    return this.request<Task[]>(`/tasks/${chave}`);
  }

  async createTask(chave: 'tarefas_diarias' | 'tarefas_educacionais', titulo: string): Promise<Task[]> {
    return this.request<Task[]>(`/tasks/${chave}`, {
      method: 'POST',
      body: JSON.stringify({ titulo })
    });
  }

  async toggleTask(chave: 'tarefas_diarias' | 'tarefas_educacionais', idx: number): Promise<Task[]> {
    return this.request<Task[]>(`/tasks/${chave}/${idx}/toggle`, {
      method: 'PATCH'
    });
  }

  async toggleStep(
    chave: 'tarefas_diarias' | 'tarefas_educacionais',
    taskIdx: number,
    stepIdx: number
  ): Promise<Task[]> {
    return this.request<Task[]>(`/tasks/${chave}/${taskIdx}/steps/${stepIdx}/toggle`, {
      method: 'PATCH'
    });
  }

  async injectSteps(
    chave: 'tarefas_diarias' | 'tarefas_educacionais',
    idx: number,
    passos: string[]
  ): Promise<Task[]> {
    return this.request<Task[]>(`/tasks/${chave}/${idx}/inject-steps`, {
      method: 'POST',
      body: JSON.stringify({ passos })
    });
  }

  async deleteTask(chave: 'tarefas_diarias' | 'tarefas_educacionais', idx: number): Promise<Task[]> {
    return this.request<Task[]>(`/tasks/${chave}/${idx}`, {
      method: 'DELETE'
    });
  }

  // NEURA
  async sendNeuraMessage(pergunta: string, estilo?: string): Promise<{ resposta: string[]; resposta_texto: string }> {
    return this.request<{ resposta: string[]; resposta_texto: string }>('/neura/chat', {
      method: 'POST',
      body: JSON.stringify({ pergunta, estilo })
    });
  }

  async breakdownTask(
    tarefa_titulo: string,
    historico: { role: string; content: string }[],
    resposta_usuario?: string,
    tentativas: number = 1,
    solicitar_geracao_imediata: boolean = false
  ): Promise<{
    linhas: string[];
    gerou_passos: boolean;
    tentativas: number;
    passos_sugeridos: string[];
    historico_atualizado: { role: string; content: string }[];
  }> {
    return this.request<{
      linhas: string[];
      gerou_passos: boolean;
      tentativas: number;
      passos_sugeridos: string[];
      historico_atualizado: { role: string; content: string }[];
    }>('/neura/breakdown', {
      method: 'POST',
      body: JSON.stringify({
        tarefa_titulo,
        historico,
        resposta_usuario,
        tentativas,
        solicitar_geracao_imediata
      })
    });
  }

  // Agenda
  async getAgenda(): Promise<AgendaEvent[]> {
    return this.request<AgendaEvent[]>('/agenda');
  }

  async createAgendaEvent(titulo: string, data: string, hora: string): Promise<AgendaEvent[]> {
    return this.request<AgendaEvent[]>('/agenda', {
      method: 'POST',
      body: JSON.stringify({ titulo, data, hora })
    });
  }

  async toggleAgendaEvent(idx: number): Promise<AgendaEvent[]> {
    return this.request<AgendaEvent[]>(`/agenda/${idx}/toggle`, {
      method: 'PATCH'
    });
  }

  async deleteAgendaEvent(idx: number): Promise<AgendaEvent[]> {
    return this.request<AgendaEvent[]>(`/agenda/${idx}`, {
      method: 'DELETE'
    });
  }

  // Shopping
  async getShoppingList(): Promise<ShoppingList> {
    return this.request<ShoppingList>('/shopping');
  }

  async createShoppingList(itens: string[]): Promise<ShoppingList> {
    return this.request<ShoppingList>('/shopping', {
      method: 'POST',
      body: JSON.stringify({ itens })
    });
  }

  async addShoppingItem(nome: string): Promise<ShoppingList> {
    return this.request<ShoppingList>('/shopping/item', {
      method: 'POST',
      body: JSON.stringify({ nome })
    });
  }

  async toggleShoppingItem(idx: number): Promise<ShoppingList> {
    return this.request<ShoppingList>(`/shopping/items/${idx}/toggle`, {
      method: 'PATCH'
    });
  }

  async reuseShoppingList(): Promise<ShoppingList> {
    return this.request<ShoppingList>('/shopping/reuse', {
      method: 'POST'
    });
  }

  async deleteShoppingList(): Promise<ShoppingList> {
    return this.request<ShoppingList>('/shopping', {
      method: 'DELETE'
    });
  }
}

export const api = new ApiService();
