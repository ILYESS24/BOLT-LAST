import React from 'react';
import { useLoadApp } from '../hooks/useLoadApp';
import { currentAppAtom } from '../atoms/appAtoms';
import { useAtom } from 'jotai';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function AppDetailsPage() {
  const [_currentApp] = useAtom(currentAppAtom);
  const { loadApp: _loadApp, isLoading, error } = useLoadApp();
  const [app, _setApp] = React.useState<any>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement de l'application...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Erreur: {error}</div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Aucune application sélectionnée</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{app.name}</h1>
          {app.description && (
            <p className="text-muted-foreground mt-1">{app.description}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Modifier</Button>
          <Button>Exécuter</Button>
        </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fichiers</CardTitle>
            <CardDescription>
              Gérer les fichiers de l'application
            </CardDescription>
          </CardHeader>
          <CardContent>
            {app.files && app.files.length > 0 ? (
              <div className="space-y-2">
                {app.files.map((file: any) => (
                  <div key={file.id} className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">{file.path}</span>
                    <span className="text-xs text-muted-foreground">
                      {file.size} bytes
                  </span>
                </div>
                ))}
                </div>
            ) : (
              <p className="text-muted-foreground">Aucun fichier</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
            <CardDescription>
              Détails de l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">ID:</span>
              <span className="text-sm text-muted-foreground">{app.id}</span>
                </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Créé le:</span>
              <span className="text-sm text-muted-foreground">
                {new Date(app.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Modifié le:</span>
              <span className="text-sm text-muted-foreground">
                {new Date(app.updatedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}