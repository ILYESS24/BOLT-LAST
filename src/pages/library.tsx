import React from 'react';
import { useLoadApps } from '@/hooks/useLoadApps';
import { App } from '@/atoms/appAtoms';

export function LibraryPage() {
  const { apps, isLoading, error } = useLoadApps();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement de la bibliothèque...</div>
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
      <h1 className="text-2xl font-bold mb-6">Bibliothèque d'applications</h1>
      
      {apps.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune application dans votre bibliothèque</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app: App) => (
            <div key={app.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">{app.name}</h3>
              {app.description && (
                <p className="text-gray-600 mb-3">{app.description}</p>
              )}
              <div className="text-sm text-gray-500">
                Créé le {new Date(app.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}