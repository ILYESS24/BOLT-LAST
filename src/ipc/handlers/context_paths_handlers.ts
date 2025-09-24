import { db } from "@/db";
import { apps } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  AppChatContext,
  AppChatContextSchema,
  ContextPathResults,
} from "@/lib/schemas";
import { estimateTokens } from "../utils/token_utils";
// import log from "electron-log";
import { getDyadAppPath } from "@/paths/paths";
import { extractCodebase } from "@/utils/codebase";
import { validateChatContext } from "../utils/context_paths_utils";
import { ipcMain } from "electron";


export function registerContextPathsHandlers() {
  ipcMain.handle(
    "get-context-paths",
    async (_, { appId }: { appId: number }): Promise<ContextPathResults> => {
      z.object({ appId: z.number() }).parse({ appId });

      const app = await db.query.apps.findFirst({
        where: eq(apps.id, appId),
      });

      if (!app) {
        throw new Error("App not found");
      }

      if (!app.path) {
        throw new Error("App path not set");
      }
      const appPath = getDyadAppPath(app.path);

      const results: ContextPathResults = {
        paths: [],
        contextPaths: [],
        smartContextAutoIncludes: [],
        excludePaths: [],
        totalFiles: 0,
        lastScanned: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
        const { contextPaths, smartContextAutoIncludes, excludePaths } =
        validateChatContext(app.chatContext);
      for (const contextPath of contextPaths) {
        const { formattedOutput, files: _files } = await extractCodebase({
          appPath,
          chatContext: {
            appId: app.id.toString(),
            chatId: "0", // Chat par défaut
            contextPaths: [contextPath],
            smartContextAutoIncludes: [],
            excludePaths: [],
            lastUpdated: new Date().toISOString(),
          },
        });
        const _totalTokens = estimateTokens(formattedOutput);

        results.contextPaths.push({
          ...contextPath,
          files: _files.length,
          tokens: _totalTokens,
        });
      }

      for (const contextPath of smartContextAutoIncludes) {
        const { formattedOutput, files: _files } = await extractCodebase({
          appPath,
          chatContext: {
            appId: app.id.toString(),
            chatId: "0", // Chat par défaut
            contextPaths: [contextPath],
            smartContextAutoIncludes: [],
            excludePaths: [],
            lastUpdated: new Date().toISOString(),
          },
        });
        const _totalTokens = estimateTokens(formattedOutput);

        results.smartContextAutoIncludes.push({
          ...contextPath,
          files: _files.length,
          tokens: _totalTokens,
        });
      }

      for (const excludePath of excludePaths || []) {
        const { formattedOutput, files: _files } = await extractCodebase({
          appPath,
          chatContext: {
            appId: app.id.toString(),
            chatId: "0", // Chat par défaut
            contextPaths: [{ globPath: excludePath }],
            smartContextAutoIncludes: [],
            excludePaths: [],
            lastUpdated: new Date().toISOString(),
          },
        });
        const _totalTokens = estimateTokens(formattedOutput);

        results.excludePaths.push(excludePath);
      }
      return results;
    },
  );

  ipcMain.handle(
    "set-context-paths",
    async (
      _,
      { appId, chatContext }: { appId: number; chatContext: AppChatContext },
    ) => {
      const schema = z.object({
        appId: z.number(),
        chatContext: AppChatContextSchema,
      });
      schema.parse({ appId, chatContext });

      await db.update(apps).set({ chatContext }).where(eq(apps.id, appId));
    },
  );
}
