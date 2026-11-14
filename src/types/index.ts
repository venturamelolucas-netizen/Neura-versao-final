export interface TaskStep {
  texto: string;
  concluido: boolean;
}

export interface Task {
  id: number;
  titulo: string;
  concluida: boolean;
  passos: TaskStep[];
}

export interface AgendaEvent {
  id: number;
  titulo: string;
  data: string;
  hora: string;
  feito: boolean;
}

export interface ShoppingItem {
  id: number;
  nome: string;
  comprado: boolean;
}

export interface ShoppingList {
  itens: ShoppingItem[];
}

export interface UserPreferences {
  estilo_instrucao: 'direto' | 'detalhado';
}

export interface User {
  nome: string;
  email: string;
  whatsapp: string;
  preferencias: UserPreferences;
  tarefas_diarias: Task[];
  tarefas_educacionais: Task[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'neura';
  text: string;
  time: string;
}
