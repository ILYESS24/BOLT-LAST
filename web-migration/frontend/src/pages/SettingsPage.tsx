import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';
import { Save, RefreshCw } from 'lucide-react';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    selectedModel: { provider: 'openai', model: 'gpt-4' },
    releaseChannel: 'stable' as const,
    language: 'fr',
    autoSave: true,
    notifications: true,
  });
  const queryClient = useQueryClient();

  // Récupérer les paramètres
  const { data: userSettings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: ApiService.getSettings,
  });

  // Mutation pour mettre à jour les paramètres
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: any) => ApiService.updateSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  // Mettre à jour les paramètres locaux quand les données arrivent
  useState(() => {
    if (userSettings) {
      setSettings(userSettings);
    }
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleReset = () => {
    const defaultSettings = {
      selectedModel: { provider: 'openai', model: 'gpt-4' },
      releaseChannel: 'stable' as const,
      language: 'fr',
      autoSave: true,
      notifications: true,
    };
    setSettings(defaultSettings);
    updateSettingsMutation.mutate(defaultSettings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Paramètres
        </h1>
        <p className="text-muted-foreground">
          Configurez vos préférences et paramètres de l'application.
        </p>
      </div>

      <div className="space-y-8">
        {/* Apparence */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Apparence</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Thème
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="system">Système</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modèle IA */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Modèle IA</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fournisseur
              </label>
              <select
                value={settings.selectedModel.provider}
                onChange={(e) => setSettings({
                  ...settings,
                  selectedModel: { ...settings.selectedModel, provider: e.target.value }
                })}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="local">Local</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Modèle
              </label>
              <select
                value={settings.selectedModel.model}
                onChange={(e) => setSettings({
                  ...settings,
                  selectedModel: { ...settings.selectedModel, model: e.target.value }
                })}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3">Claude 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Préférences */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Préférences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Langue
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Sauvegarde automatique
                </label>
                <p className="text-sm text-muted-foreground">
                  Sauvegarder automatiquement les modifications
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Notifications
                </label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 border border-input text-sm font-medium rounded-md hover:bg-accent"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Réinitialiser
          </button>
          <button
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            {updateSettingsMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}
