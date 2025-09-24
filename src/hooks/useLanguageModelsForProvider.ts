import { useQuery } from "@tanstack/react-query";
import { IpcClient } from "@/ipc/ipc_client";
import type { LanguageModel } from "@/ipc/ipc_types";

/**
 * Fetches the list of available language models for a specific provider.
 *
 * @param providerId The ID of the language model provider.
 * @returns TanStack Query result object for the language models.
 */
export function useLanguageModelsForProvider(providerId: string | undefined) {
  const ipcClient = IpcClient.getInstance();

  return useQuery<
    LanguageModel[],
    Error // Specify Error type for better error handling
  >({
    queryKey: ["language-models", providerId],
    queryFn: async () => {
      if (!providerId) {
        // Avoid calling IPC if providerId is not set
        // Return an empty array as it's a query, not an error state
        return [];
      }
      const models = await ipcClient.getLanguageModelsForProvider(providerId);
      return models.map((model: any) => ({
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
      }));
    },
    enabled: !!providerId,
  });
}
