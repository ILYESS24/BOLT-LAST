import { useState, useCallback, useEffect } from 'react';
import { App } from '../atoms/appAtoms';

export function useLoadApps() {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApps = useCallback(async (): Promise<App[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/apps');
      
      if (!response.ok) {
        throw new Error(`Failed to load apps: ${response.statusText}`);
      }

      const appsData = await response.json();
      setApps(appsData);
      return appsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createApp = useCallback(async (appData: Partial<App>): Promise<App | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create app: ${response.statusText}`);
      }

      const newApp = await response.json();
      setApps(prev => [...prev, newApp]);
      return newApp;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateApp = useCallback(async (appId: string, appData: Partial<App>): Promise<App | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/apps/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update app: ${response.statusText}`);
      }

      const updatedApp = await response.json();
      setApps(prev => prev.map(app => app.id === appId ? updatedApp : app));
      return updatedApp;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteApp = useCallback(async (appId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/apps/${appId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete app: ${response.statusText}`);
      }

      setApps(prev => prev.filter(app => app.id !== appId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les apps au montage du composant
  useEffect(() => {
    loadApps();
  }, [loadApps]);

  return {
    apps,
    loadApps,
    createApp,
    updateApp,
    deleteApp,
    isLoading,
    error,
  };
}