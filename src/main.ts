// Conversion du main process Electron en route API Next.js
import type { NextApiRequest, NextApiResponse } from 'next';
import dotenv from "dotenv";
import { registerIpcHandlers } from "../../ipc/ipc_host";
import log from "electron-log"; // À remplacer par un logger node.js ou console
import { getSettingsFilePath, readSettings, writeSettings } from "../../main/settings";
import { handleSupabaseOAuthReturn } from "../../supabase_admin/supabase_return_handler";
import { handleDyadProReturn } from "../../main/pro";
import { IS_TEST_BUILD } from "../../ipc/utils/test_utils";
import { BackupManager } from "../../backup_manager";
import { getDatabasePath, initializeDatabase } from "../../db";
import { UserSettings } from "../../lib/schemas";
import { handleNeonOAuthReturn } from "../../neon_admin/neon_return_handler";

// Ici, Next.js n'a pas de "main process" - tout est soit API route, soit page client.
// Tu peux créer ici une API qui gère les appels côté serveur.
// Exemple de handler:
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  log.errorHandler.startCatching();
  log.eventLogger.startLogging();
  log.scope.labelPadding = false;

  // Ici, tu peux router les requêtes selon le type (ex: req.body.action)
  res.status(200).json({ status: "Main API endpoint - Electron main process adapté Next.js" });
}
