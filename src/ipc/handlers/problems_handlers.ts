import { db } from "../../db";

import { apps } from "../../db/schema";
import { eq } from "drizzle-orm";
import { generateProblemReport } from "../processors/tsc";
import { getDyadAppPath } from "@/paths/paths";
import log from "electron-log";
import { ipcMain } from "electron";

const logger = log.scope("problems_handlers");

export function registerProblemsHandlers() {
  // Handler to check problems using autofix with empty response
  ipcMain.handle("check-problems", async (event, params: { appId: number }) => {
    try {
      // Get the app to find its path
      const app = await db.query.apps.findFirst({
        where: eq(apps.id, params.appId),
      });

      if (!app) {
        throw new Error(`App not found: ${params.appId}`);
      }

      const appPath = getDyadAppPath(app.path);

      // Call autofix with empty full response to just run TypeScript checking
      const problemReport = await generateProblemReport({
        fullResponse: "",
        appPath,
      });

      return problemReport;
    } catch (error) {
      logger.error("Error checking problems:", error);
      throw error;
    }
  });
}
