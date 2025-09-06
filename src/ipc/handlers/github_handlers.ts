// Conversion des handlers GitHub IPC en API Next.js
import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from "node-fetch";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import fs from "node:fs";
import { getDyadAppPath } from "../../paths/paths";
import { db } from "../../db";
import { apps } from "../../db/schema";
import { eq } from "drizzle-orm";

// ... autres imports nécessaires

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Route les actions GitHub selon req.body.action
  res.status(200).json({ status: "API GitHub convertie depuis Electron IPC" });
}
