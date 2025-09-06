// Conversion de l'IPC Main handler en route API Next.js
import type { NextApiRequest, NextApiResponse } from 'next';
import { db, getDatabasePath } from "../../db";
import { apps, chats } from "../../db/schema";
import fs from "node:fs";
import path from "node:path";
import { getDyadAppPath, getUserDataPath } from "../../paths/paths";
import { spawn } from "node:child_process";
import git from "isomorphic-git";
import { promises as fsPromises } from "node:fs";

// ... toutes les imports utilitaires

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ici, tu traites req.body.action, params, etc.
  // Exemple: création d'une app
  if (req.body.action === "create-app") {
    // logique de création
    return res.status(200).json({ status: "App créée via API Next.js" });
  }
  res.status(200).json({ status: "Handler générique des apps depuis Electron converti Next.js" });
}
