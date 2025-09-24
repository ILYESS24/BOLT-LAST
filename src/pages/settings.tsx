import React from 'react';
import { ProviderSettings } from '../components/ProviderSettings';
import { useSettings } from '../hooks/useSettings';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ ...settings, theme });
  };

  const handleLanguageChange = (language: string) => {
    updateSettings({ ...settings, language });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Paramètres</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paramètres généraux */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres généraux</CardTitle>
            <CardDescription>
              Personnalisez l'apparence et le comportement de l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Thème
              </label>
              <div className="flex space-x-2">
                {(['light', 'dark', 'system'] as const).map((theme) => (
                  <Button
                    key={theme}
                    variant={settings.theme === theme ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleThemeChange(theme)}
                  >
                    {theme === 'light' ? 'Clair' : theme === 'dark' ? 'Sombre' : 'Système'}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Langue
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoSave"
                checked={settings.autoSave}
                onChange={(e) => updateSettings({ ...settings, autoSave: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="autoSave" className="text-sm font-medium">
                Sauvegarde automatique
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Paramètres de l'éditeur */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de l'éditeur</CardTitle>
            <CardDescription>
              Configurez l'éditeur de code selon vos préférences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Taille de police: {settings.fontSize}px
              </label>
              <input
                type="range"
                min="8"
                max="24"
                value={settings.fontSize}
                onChange={(e) => updateSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Taille des tabulations: {settings.tabSize}
              </label>
              <input
                type="range"
                min="2"
                max="8"
                value={settings.tabSize}
                onChange={(e) => updateSettings({ ...settings, tabSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="wordWrap"
                  checked={settings.wordWrap}
                  onChange={(e) => updateSettings({ ...settings, wordWrap: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="wordWrap" className="text-sm font-medium">
                  Retour à la ligne automatique
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="minimap"
                  checked={settings.minimap}
                  onChange={(e) => updateSettings({ ...settings, minimap: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="minimap" className="text-sm font-medium">
                  Afficher la minimap
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="lineNumbers"
                  checked={settings.lineNumbers}
                  onChange={(e) => updateSettings({ ...settings, lineNumbers: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="lineNumbers" className="text-sm font-medium">
                  Numéros de ligne
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paramètres du fournisseur IA */}
      <ProviderSettings />

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            Réinitialiser les paramètres ou exporter/importer la configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button 
              variant="destructive" 
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
                  resetSettings();
                }
              }}
            >
              Réinitialiser les paramètres
            </Button>
            <Button variant="outline">
              Exporter la configuration
            </Button>
            <Button variant="outline">
              Importer la configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}