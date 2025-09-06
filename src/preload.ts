// Simulation de l'API des channels IPC côté Next.js
import type { NextApiRequest, NextApiResponse } from 'next';

const validInvokeChannels = [
  "get-language-models",
  "get-language-models-by-providers",
  "create-custom-language-model",
  // ... la liste complète
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ici, Next.js utilise fetch et ses propres API pour communiquer, pas IPC
  if (!validInvokeChannels.includes(req.body.channel)) {
    return res.status(403).json({ error: "Invalid channel" });
  }
  // Logique métier ici
  res.status(200).json({ channel: req.body.channel, result: "API Next.js, conversion preload Electron" });
}
