import { atom } from 'jotai';

export interface ViewState {
  sidebarVisible: boolean;
  previewVisible: boolean;
  chatVisible: boolean;
  activeTab: 'code' | 'preview' | 'chat';
  splitRatio: number; // 0-1, ratio entre sidebar et main content
}

// Atom pour l'état global de la vue
export const viewStateAtom = atom<ViewState>({
  sidebarVisible: true,
  previewVisible: true,
  chatVisible: true,
  activeTab: 'code',
  splitRatio: 0.3,
});

// Atom pour la visibilité de la sidebar
export const sidebarVisibleAtom = atom(
  (get) => get(viewStateAtom).sidebarVisible,
  (get, set, visible: boolean) => {
    set(viewStateAtom, { ...get(viewStateAtom), sidebarVisible: visible });
  }
);

// Atom pour la visibilité de la preview
export const previewVisibleAtom = atom(
  (get) => get(viewStateAtom).previewVisible,
  (get, set, visible: boolean) => {
    set(viewStateAtom, { ...get(viewStateAtom), previewVisible: visible });
  }
);

// Atom pour la visibilité du chat
export const chatVisibleAtom = atom(
  (get) => get(viewStateAtom).chatVisible,
  (get, set, visible: boolean) => {
    set(viewStateAtom, { ...get(viewStateAtom), chatVisible: visible });
  }
);

// Atom pour l'onglet actif
export const activeTabAtom = atom(
  (get) => get(viewStateAtom).activeTab,
  (get, set, tab: 'code' | 'preview' | 'chat') => {
    set(viewStateAtom, { ...get(viewStateAtom), activeTab: tab });
  }
);

// Atom pour le ratio de division
export const splitRatioAtom = atom(
  (get) => get(viewStateAtom).splitRatio,
  (get, set, ratio: number) => {
    set(viewStateAtom, { ...get(viewStateAtom), splitRatio: Math.max(0, Math.min(1, ratio)) });
  }
);

// Atoms manquants pour corriger les erreurs
export const selectedFileAtom = atom<string | null>(null);
export const isPreviewOpenAtom = atom<boolean>(true);