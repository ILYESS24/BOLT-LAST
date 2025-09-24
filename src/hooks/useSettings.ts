import { useState, useEffect, useCallback } from 'react';

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoSave: boolean;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  apiKey?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  vercelAccessToken?: string;
  enableAutoFixProblems?: boolean;
  providerSettings?: Record<string, any>;
  envVars?: Record<string, string>;
  telemetryConsent?: 'opted_in' | 'opted_out' | 'unset';
  acceptedCommunityCode?: boolean;
  neon?: {
    accessToken?: string;
  };
  selectedTemplateId?: string;
  thinkingBudget?: 'low' | 'medium' | 'high';
  supabase?: {
    accessToken?: string;
  };
  isTestMode?: boolean;
  enableSupabaseWriteSqlMigration?: boolean;
  enableDyadPro?: boolean;
  releaseChannel?: string;
  runtimeMode2?: string;
}

const defaultSettings: Settings = {
  theme: 'system',
  language: 'en',
  autoSave: true,
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: true,
  lineNumbers: true,
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les paramètres depuis le stockage local
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = localStorage.getItem('dyad-settings');
        if (stored) {
          const parsedSettings = JSON.parse(stored);
          setSettings({ ...defaultSettings, ...parsedSettings });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        setError('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Sauvegarder les paramètres
  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('dyad-settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Réinitialiser les paramètres
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem('dyad-settings');
  }, []);

  // Fonction pour rafraîchir les paramètres
  const refreshSettings = useCallback(() => {
    // Recharger les paramètres depuis le stockage local
    const stored = localStorage.getItem('dyad-settings');
    if (stored) {
      const parsedSettings = JSON.parse(stored);
      setSettings({ ...defaultSettings, ...parsedSettings });
    }
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    refreshSettings,
    isLoading,
    loading: isLoading,
    error,
    envVars: settings.envVars || {},
  };
}

// Fonctions utilitaires pour la télémétrie
export function getTelemetryUserId(): string {
  const stored = localStorage.getItem('dyad-telemetry-user-id');
  if (stored) {
    return stored;
  }
  
  // Générer un nouvel ID utilisateur
  const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('dyad-telemetry-user-id', newId);
  return newId;
}

export function isTelemetryOptedIn(): boolean {
  const stored = localStorage.getItem('dyad-telemetry-consent');
  return stored === 'accepted';
}