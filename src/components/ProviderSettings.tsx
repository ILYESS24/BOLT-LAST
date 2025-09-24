import React, { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ProviderSettings() {
  const { settings, updateSettings } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    apiKey: settings.apiKey || '',
    model: settings.model || 'gpt-4',
    temperature: settings.temperature || 0.7,
    maxTokens: settings.maxTokens || 2000,
  });

  const handleSave = () => {
    updateSettings({
      ...settings,
      ...formData,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      apiKey: settings.apiKey || '',
      model: settings.model || 'gpt-4',
      temperature: settings.temperature || 0.7,
      maxTokens: settings.maxTokens || 2000,
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres du fournisseur IA</CardTitle>
        <CardDescription>
          Configurez votre clé API et les paramètres du modèle
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Clé API
          </label>
          <input
            type="password"
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
            placeholder="Entrez votre clé API"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Modèle
          </label>
          <select
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
          >
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="claude-3">Claude 3</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Température: {formData.temperature}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={formData.temperature}
            onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
            disabled={!isEditing}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Tokens maximum
          </label>
          <input
            type="number"
            min="1"
            max="4000"
            value={formData.maxTokens}
            onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
          />
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave}>Sauvegarder</Button>
              <Button variant="outline" onClick={handleCancel}>Annuler</Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Modifier</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}