import { useQuery } from "@tanstack/react-query";
import { IpcClient } from "@/ipc/ipc_client";
import type { LanguageModelProvider } from "@/ipc/ipc_types";
import { useSettings } from "./useSettings";
// import { cloudProviders } from "@/lib/schemas";

export function useLanguageModelProviders() {
  const ipcClient = IpcClient.getInstance();
  const { settings, envVars } = useSettings();

  const queryResult = useQuery<LanguageModelProvider[], Error>({
    queryKey: ["languageModelProviders"],
    queryFn: async () => {
      const providers = await ipcClient.getLanguageModelProviders();
      return providers.map((provider: string) => ({
        id: provider,
        name: provider,
        apiBaseUrl: "",
        envVarName: undefined,
        type: "cloud" as const,
      }));
    },
  });

  const isProviderSetup = (provider: string) => {
    const providerSettings = settings?.providerSettings?.[provider];
    if (queryResult.isLoading) {
      return false;
    }
    if (providerSettings?.apiKey?.value) {
      return true;
    }
    const providerData = queryResult.data?.find((p: any) => p.id === provider);
    if (providerData?.envVarName && envVars[providerData.envVarName]) {
      return true;
    }
    return false;
  };

  const isAnyProviderSetup = () => {
    const cloudProviders = ["openai", "anthropic", "google", "azure"];
    return cloudProviders.some((provider) => isProviderSetup(provider));
  };

  return {
    ...queryResult,
    isProviderSetup,
    isAnyProviderSetup,
  };
}
