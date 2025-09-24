import React from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AutoApproveSwitch() {
  const { settings, updateSettings } = useSettings();

  const handleToggle = (enabled: boolean) => {
    updateSettings({ ...settings, autoApprove: enabled } as any);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approbation automatique</CardTitle>
        <CardDescription>
          Approuver automatiquement les modifications suggérées par l'IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {(settings as any).autoApprove ? 'Activé' : 'Désactivé'}
            </p>
            <p className="text-xs text-muted-foreground">
              {(settings as any).autoApprove 
                ? 'Les modifications seront appliquées automatiquement'
                : 'Vous devrez approuver chaque modification manuellement'
              }
            </p>
          </div>
          <button
            onClick={() => handleToggle(!(settings as any).autoApprove)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              (settings as any).autoApprove ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                (settings as any).autoApprove ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}