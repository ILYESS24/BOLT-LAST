// Conversion de l'IPC Renderer en client fetch pour Next.js API
export async function invokeChannel(channel: string, data: any) {
  const res = await fetch('/api/preload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel, ...data })
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}
