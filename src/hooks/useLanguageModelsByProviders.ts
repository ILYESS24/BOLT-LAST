import { useQuery } from "@tanstack/react-query";
import { IpcClient } from "@/ipc/ipc_client";
import type { LanguageModel } from "@/ipc/ipc_types";

/**
 * Fetches all available language models grouped by their provider IDs.
 *
 * @returns TanStack Query result object for the language models organized by provider.
 */
export function useLanguageModelsByProviders() {
  const ipcClient = IpcClient.getInstance();

  return useQuery<Record<string, LanguageModel[]>, Error>({
    queryKey: ["language-models-by-providers"],
    queryFn: async () => {
      const models = await ipcClient.getLanguageModelsByProviders();
      return Object.fromEntries(
        Object.entries(models).map(([provider, providerModels]) => [
          provider,
          providerModels.map((model: any) => ({
            id: model.id || Date.now(),
            apiName: model.apiName || model.name,
            displayName: model.displayName || model.name,
            description: model.description || "",
            tag: model.tag,
            maxOutputTokens: model.maxOutputTokens,
            contextWindow: model.contextWindow,
            temperature: model.temperature,
            dollarSigns: model.dollarSigns,
            type: model.type || "custom",
          }))
        ])
      );
    },
  });
}
