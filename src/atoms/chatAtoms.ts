import { atom } from 'jotai';
import type { ChatSummary } from '../lib/schemas';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  currentAppId: string | null;
}

// Atom pour l'état global du chat
export const chatStateAtom = atom<ChatState>({
  messages: [],
  isLoading: false,
  error: null,
  currentAppId: null,
});

// Atom pour les messages
export const messagesAtom = atom(
  (get) => get(chatStateAtom).messages,
  (get, set, messages: ChatMessage[]) => {
    set(chatStateAtom, { ...get(chatStateAtom), messages });
  }
);

// Atom pour l'état de chargement
export const chatLoadingAtom = atom(
  (get) => get(chatStateAtom).isLoading,
  (get, set, isLoading: boolean) => {
    set(chatStateAtom, { ...get(chatStateAtom), isLoading });
  }
);

// Atom pour les erreurs
export const chatErrorAtom = atom(
  (get) => get(chatStateAtom).error,
  (get, set, error: string | null) => {
    set(chatStateAtom, { ...get(chatStateAtom), error });
  }
);

// Atom pour l'ID de l'application courante
export const currentAppIdAtom = atom(
  (get) => get(chatStateAtom).currentAppId,
  (get, set, appId: string | null) => {
    set(chatStateAtom, { ...get(chatStateAtom), currentAppId: appId });
  }
);

// Atom pour ajouter un message
export const addMessageAtom = atom(
  null,
  (get, set, message: ChatMessage) => {
    const currentMessages = get(messagesAtom);
    set(messagesAtom, [...currentMessages, message]);
  }
);

// Atom pour effacer les messages
export const clearMessagesAtom = atom(
  null,
  (get, set) => {
    set(messagesAtom, []);
  }
);

// Atom pour les messages du chat (alias pour messagesAtom)
export const chatMessagesAtom = messagesAtom;

// Atom pour l'ID du chat sélectionné
export const selectedChatIdAtom = atom<string | null>(null);

// Atom pour la liste des chats
export const chatsAtom = atom<ChatSummary[]>([]);

// Atoms manquants pour corriger les erreurs
export const chatInputValueAtom = atom<string>("");
export const homeChatInputValueAtom = atom<string>("");
export const isStreamingAtom = atom<boolean>(false);
export const chatStreamCountAtom = atom<number>(0);