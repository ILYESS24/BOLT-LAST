import { shell , ipcMain } from "electron";
import log from "electron-log";


const logger = log.scope("shell_handlers");

export function registerShellHandlers() {
  ipcMain.handle("open-external-url", async (_event, url: string) => {
    if (!url) {
      throw new Error("No URL provided.");
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      throw new Error("Attempted to open invalid or non-http URL: " + url);
    }
    await shell.openExternal(url);
    logger.debug("Opened external URL:", url);
  });

  ipcMain.handle("show-item-in-folder", async (_event, fullPath: string) => {
    // Validate that a path was provided
    if (!fullPath) {
      throw new Error("No file path provided.");
    }

    shell.showItemInFolder(fullPath);
    logger.debug("Showed item in folder:", fullPath);
  });
}
