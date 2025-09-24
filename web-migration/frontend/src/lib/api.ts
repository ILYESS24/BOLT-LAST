import axios from 'axios';

// Configuration de l'instance Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types pour les données
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface App {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface File {
  id: string;
  path: string;
  content: string;
  size: number;
  appId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  chatId: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  appId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

// Service API
export class ApiService {
  // Authentification
  static async register(data: { email: string; password: string; name: string }) {
    const response = await api.post('/auth/register', data);
    return response.data;
  }

  static async login(data: { email: string; password: string }) {
    const response = await api.post('/auth/login', data);
    return response.data;
  }

  static async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }

  // Applications
  static async getApps(): Promise<App[]> {
    const response = await api.get('/apps');
    return response.data;
  }

  static async getApp(id: string): Promise<App> {
    const response = await api.get(`/apps/${id}`);
    return response.data;
  }

  static async createApp(data: { name: string; description?: string; templateId?: string }): Promise<App> {
    const response = await api.post('/apps', data);
    return response.data;
  }

  static async updateApp(id: string, data: { name?: string; description?: string }): Promise<App> {
    const response = await api.put(`/apps/${id}`, data);
    return response.data;
  }

  static async deleteApp(id: string): Promise<void> {
    await api.delete(`/apps/${id}`);
  }

  // Fichiers
  static async getAppFiles(appId: string): Promise<File[]> {
    const response = await api.get(`/apps/${appId}/files`);
    return response.data;
  }

  static async readFile(appId: string, path: string): Promise<{ content: string }> {
    const response = await api.get(`/files/read`, {
      params: { appId, path }
    });
    return response.data;
  }

  static async writeFile(appId: string, data: { path: string; content: string }): Promise<{ success: boolean }> {
    const response = await api.post('/files/write', { appId, ...data });
    return response.data;
  }

  static async deleteFile(appId: string, data: { path: string }): Promise<{ success: boolean }> {
    const response = await api.delete('/files/delete', {
      data: { appId, ...data }
    });
    return response.data;
  }

  static async renameFile(appId: string, data: { from: string; to: string }): Promise<{ success: boolean }> {
    const response = await api.put('/files/rename', { appId, ...data });
    return response.data;
  }

  // Chat
  static async getChatHistory(appId: string): Promise<ChatMessage[]> {
    const response = await api.get(`/chat/${appId}/history`);
    return response.data;
  }

  static async sendChatMessage(appId: string, data: { message: string; model?: string }): Promise<{ userMessage: ChatMessage; aiMessage: ChatMessage }> {
    const response = await api.post(`/chat/${appId}/send`, data);
    return response.data;
  }

  static async createChat(appId: string, data: { title: string }): Promise<Chat> {
    const response = await api.post(`/chat/${appId}/create`, data);
    return response.data;
  }

  // Export
  static async exportApp(appId: string): Promise<Blob> {
    const response = await api.get(`/apps/${appId}/export`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Templates
  static async getTemplates(): Promise<any[]> {
    const response = await api.get('/templates');
    return response.data;
  }

  // Paramètres
  static async getSettings(): Promise<any> {
    const response = await api.get('/settings');
    return response.data;
  }

  static async updateSettings(data: any): Promise<any> {
    const response = await api.put('/settings', data);
    return response.data;
  }
}

export default ApiService;