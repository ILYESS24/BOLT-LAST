import { useState, useCallback } from 'react';
import { App } from '../lib/schemas';

export function useLoadApp(_appId?: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [app, setApp] = useState<App | null>(null);

  const loadApp = useCallback(async (appId: string): Promise<App | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulation du chargement d'une application
      // Dans une vraie implémentation, ceci ferait un appel API
      const response = await fetch(`/api/apps/${appId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load app: ${response.statusText}`);
      }

      const app = await response.json();
      setApp(app);
      return app;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
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

      const app = await response.json();
      return app;
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

      const app = await response.json();
      return app;
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

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshApp = useCallback(() => {
    if (app?.id) {
      loadApp(app.id);
    }
  }, [app?.id, loadApp]);

  return {
    loadApp,
    createApp,
    updateApp,
    deleteApp,
    refreshApp,
    app,
    loading: isLoading,
    isLoading,
    error,
  };
}