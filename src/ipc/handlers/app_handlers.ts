import { ipcMain } from 'electron';
import { safeHandle } from './safe_handle';

export function registerAppHandlers() {
  // Handler pour créer une application
  ipcMain.handle('create-app', safeHandle(async (event, appData) => {
    // TODO: Implémenter la création d'application
    console.log('Creating app:', appData);
    return { success: true, appId: 'mock-app-id' };
  }));

  // Handler pour lister les applications
  ipcMain.handle('list-apps', safeHandle(async (_event) => {
    // TODO: Implémenter la liste des applications
    console.log('Listing apps');
    return [];
  }));

  // Handler pour obtenir une application
  ipcMain.handle('get-app', safeHandle(async (event, appId: string) => {
    // TODO: Implémenter la récupération d'application
    console.log('Getting app:', appId);
    return null;
  }));

  // Handler pour mettre à jour une application
  ipcMain.handle('update-app', safeHandle(async (event, appId: string, appData) => {
    // TODO: Implémenter la mise à jour d'application
    console.log('Updating app:', appId, appData);
    return { success: true };
  }));

  // Handler pour supprimer une application
  ipcMain.handle('delete-app', safeHandle(async (event, appId: string) => {
    // TODO: Implémenter la suppression d'application
    console.log('Deleting app:', appId);
    return { success: true };
  }));
}
