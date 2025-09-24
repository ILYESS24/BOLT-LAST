import log from "electron-log";
import { getAllTemplates } from "../utils/template_utils";
import { localTemplatesData, type Template } from "../../shared/templates";
import { ipcMain } from "electron";

const logger = log.scope("template_handlers");

export function registerTemplateHandlers() {
  ipcMain.handle("get-templates", async (): Promise<Template[]> => {
    try {
      const templates = await getAllTemplates();
      return templates;
    } catch (error) {
      logger.error("Error fetching templates:", error);
      return localTemplatesData;
    }
  });
}
