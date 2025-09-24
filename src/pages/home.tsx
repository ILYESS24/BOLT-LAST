import React from 'react';
import { useLoadApps } from '@/hooks/useLoadApps';
import { currentAppAtom } from '@/atoms/appAtoms';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function HomePage() {
  const { apps, isLoading, error } = useLoadApps();
  const [currentApp, setCurrentApp] = useAtom(currentAppAtom);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement...</div>
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes Applications</h1>
        <Button>Nouvelle Application</Button>
      </div>

      {apps.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucune application</CardTitle>
            <CardDescription>
              Créez votre première application pour commencer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Créer une application</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Card 
              key={app.id} 
              className={`cursor-pointer transition-colors ${
                currentApp?.id === app.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setCurrentApp(app)}
            >
              <CardHeader>
                <CardTitle>{app.name}</CardTitle>
                {app.description && (
                  <CardDescription>{app.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Créé le {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}