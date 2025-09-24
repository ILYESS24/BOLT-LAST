import { ipcRenderer } from "electron";

// Types pour les données IPC
export interface DeepLinkData {
  url: string;
  timestamp: number;
}

export interface UpgradeInfo {
  id: string;
  name: string;
  description: string;
  isNeeded: boolean;
  version: string;
}

export interface EnvVar {
  key: string;
  value: string;
  isSecret: boolean;
}

export interface LanguageModel {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  maxTokens: number;
  costPerToken: number;
}

export interface App {
  id: string;
  name: string;
  description?: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

export class IpcClient {
  private static instance: IpcClient;

  private constructor() {}

  public static getInstance(): IpcClient {
    if (!IpcClient.instance) {
      IpcClient.instance = new IpcClient();
    }
    return IpcClient.instance;
  }

  // Méthodes pour les applications
  async getApps(): Promise<App[]> {
    return await ipcRenderer.invoke("get-apps");
  }

  async createApp(appData: Partial<App>): Promise<App> {
    return await ipcRenderer.invoke("create-app", { appData });
  }

  async updateApp(appId: string, appData: Partial<App>): Promise<App> {
    return await ipcRenderer.invoke("update-app", { appId, appData });
  }

  async deleteApp(appId: string): Promise<void> {
    return await ipcRenderer.invoke("delete-app", { appId });
  }

  async getApp(appId: string): Promise<App> {
    return await ipcRenderer.invoke("get-app", { appId });
  }

  // Méthodes pour les fichiers
  async readFile(appId: string, path: string): Promise<string> {
    return await ipcRenderer.invoke("read-file", { appId, path });
  }

  async writeFile(appId: string, path: string, content: string): Promise<void> {
    return await ipcRenderer.invoke("write-file", { appId, path, content });
  }

  async deleteFile(appId: string, path: string): Promise<void> {
    return await ipcRenderer.invoke("delete-file", { appId, path });
  }

  async listFiles(appId: string, directory = "/"): Promise<string[]> {
    return await ipcRenderer.invoke("list-files", { appId, directory });
  }

  // Méthodes pour le chat
  async sendMessage(appId: string, message: string): Promise<StreamChunk[]> {
    return await ipcRenderer.invoke("send-message", { appId, message });
  }

  async getChatHistory(appId: string): Promise<ChatMessage[]> {
    return await ipcRenderer.invoke("get-chat-history", { appId });
  }

  // Méthodes pour les paramètres
  async getSettings(): Promise<any> {
    return await ipcRenderer.invoke("get-settings");
  }

  async updateSettings(settings: any): Promise<void> {
    return await ipcRenderer.invoke("update-settings", { settings });
  }

  // Méthodes pour les modèles de langage
  async getLanguageModels(): Promise<LanguageModel[]> {
    return await ipcRenderer.invoke("get-language-models");
  }

  async getLanguageModelProviders(): Promise<string[]> {
    return await ipcRenderer.invoke("get-language-model-providers");
  }

  async getLanguageModelsByProviders(): Promise<Record<string, LanguageModel[]>> {
    return await ipcRenderer.invoke("get-language-models-by-providers");
  }

  async getLanguageModelsForProvider(provider: string): Promise<LanguageModel[]> {
    return await ipcRenderer.invoke("get-language-models-for-provider", { provider });
  }

  // Méthodes pour les modèles personnalisés
  async getCustomLanguageModelProviders(): Promise<any[]> {
    return await ipcRenderer.invoke("get-custom-language-model-providers");
  }

  async createCustomLanguageModelProvider(provider: any): Promise<void> {
    return await ipcRenderer.invoke("create-custom-language-model-provider", { provider });
  }

  async updateCustomLanguageModelProvider(providerId: string, provider: any): Promise<void> {
    return await ipcRenderer.invoke("update-custom-language-model-provider", { providerId, provider });
  }

  async deleteCustomLanguageModelProvider(providerId: string): Promise<void> {
    return await ipcRenderer.invoke("delete-custom-language-model-provider", { providerId });
  }

  // Méthodes pour les templates
  async getTemplates(): Promise<any[]> {
    return await ipcRenderer.invoke("get-templates");
  }

  async createFromTemplate(templateId: string, appName: string): Promise<App> {
    return await ipcRenderer.invoke("create-from-template", { templateId, appName });
  }

  // Méthodes pour les versions
  async getVersions(appId: string): Promise<any[]> {
    return await ipcRenderer.invoke("get-versions", { appId });
  }

  async checkoutVersion(appId: string, versionId: string): Promise<void> {
    return await ipcRenderer.invoke("checkout-version", { appId, versionId });
  }

  // Méthodes pour les problèmes
  async checkProblems(appId: string): Promise<any[]> {
    return await ipcRenderer.invoke("check-problems", { appId });
  }

  // Méthodes pour les dépendances
  async addDependency(appId: string, dependency: string): Promise<void> {
    return await ipcRenderer.invoke("add-dependency", { appId, dependency });
  }

  async removeDependency(appId: string, dependency: string): Promise<void> {
    return await ipcRenderer.invoke("remove-dependency", { appId, dependency });
  }

  // Méthodes pour les variables d'environnement
  async getEnvVars(appId: string): Promise<EnvVar[]> {
    return await ipcRenderer.invoke("get-env-vars", { appId });
  }

  async setEnvVar(appId: string, key: string, value: string, isSecret = false): Promise<void> {
    return await ipcRenderer.invoke("set-env-var", { appId, key, value, isSecret });
  }

  async deleteEnvVar(appId: string, key: string): Promise<void> {
    return await ipcRenderer.invoke("delete-env-var", { appId, key });
  }

  // Méthodes pour les prompts
  async getPrompts(): Promise<any[]> {
    return await ipcRenderer.invoke("get-prompts");
  }

  async createPrompt(prompt: any): Promise<void> {
    return await ipcRenderer.invoke("create-prompt", { prompt });
  }

  async updatePrompt(promptId: string, prompt: any): Promise<void> {
    return await ipcRenderer.invoke("update-prompt", { promptId, prompt });
  }

  async deletePrompt(promptId: string): Promise<void> {
    return await ipcRenderer.invoke("delete-prompt", { promptId });
  }

  // Méthodes pour les contextes
  async getContextPaths(appId: string): Promise<string[]> {
    return await ipcRenderer.invoke("get-context-paths", { appId });
  }

  async setContextPaths(appId: string, paths: string[]): Promise<void> {
    return await ipcRenderer.invoke("set-context-paths", { appId, paths });
  }

  // Méthodes pour les versions
  async getAppVersion(): Promise<string> {
    return await ipcRenderer.invoke("get-app-version");
  }

  // Méthodes pour les branches Git
  async getCurrentBranch(appId: string): Promise<string> {
    return await ipcRenderer.invoke("get-current-branch", { appId });
  }

  async renameBranch(appId: string, oldName: string, newName: string): Promise<void> {
    return await ipcRenderer.invoke("rename-branch", { appId, oldName, newName });
  }

  // Méthodes pour les déploiements
  async getVercelDeployments(appId: string): Promise<any[]> {
    return await ipcRenderer.invoke("get-vercel-deployments", { appId });
  }

  async deployToVercel(appId: string): Promise<any> {
    return await ipcRenderer.invoke("deploy-to-vercel", { appId });
  }

  // Méthodes pour les mises à jour
  async checkForUpdates(): Promise<UpgradeInfo | null> {
    return await ipcRenderer.invoke("check-for-updates");
  }

  async downloadUpdate(): Promise<void> {
    return await ipcRenderer.invoke("download-update");
  }

  async installUpdate(): Promise<void> {
    return await ipcRenderer.invoke("install-update");
  }

  // Méthodes pour les deep links
  async handleDeepLink(data: DeepLinkData): Promise<void> {
    return await ipcRenderer.invoke("handle-deep-link", { data });
  }

  // Méthodes pour les budgets
  async getUserBudgetInfo(): Promise<any> {
    return await ipcRenderer.invoke("get-user-budget-info");
  }


  // Méthodes pour les sessions
  async getSession(): Promise<any> {
    return await ipcRenderer.invoke("get-session");
  }

  async setSession(session: any): Promise<void> {
    return await ipcRenderer.invoke("set-session", { session });
  }

  // Méthodes pour les propositions
  async getProposal(appId: string): Promise<any> {
    return await ipcRenderer.invoke("get-proposal", { appId });
  }

  async applyProposal(appId: string, proposalId: string): Promise<void> {
    return await ipcRenderer.invoke("apply-proposal", { appId, proposalId });
  }

  // Méthodes pour les uploads
  async uploadFile(appId: string, file: File): Promise<string> {
    return await ipcRenderer.invoke("upload-file", { appId, file });
  }

  // Méthodes pour les fenêtres
  async minimizeWindow(): Promise<void> {
    return await ipcRenderer.invoke("minimize-window");
  }

  async maximizeWindow(): Promise<void> {
    return await ipcRenderer.invoke("maximize-window");
  }

  async closeWindow(): Promise<void> {
    return await ipcRenderer.invoke("close-window");
  }

  // Méthodes pour les tokens
  async countTokens(text: string, modelId: string): Promise<number> {
    return await ipcRenderer.invoke("count-tokens", { text, modelId });
  }

  // Méthodes pour les modèles locaux
  async getLocalModels(): Promise<any[]> {
    return await ipcRenderer.invoke("get-local-models");
  }

  // Méthodes pour les modèles LM Studio
  async getLMStudioModels(): Promise<any[]> {
    return await ipcRenderer.invoke("get-lm-studio-models");
  }

  // Méthodes manquantes pour corriger les erreurs
  async openExternalUrl(url: string): Promise<void> {
    return await ipcRenderer.invoke("open-external-url", { url });
  }

  async getChat(chatId: string): Promise<any> {
    return await ipcRenderer.invoke("get-chat", { chatId });
  }

  async createChat(appId: string): Promise<string> {
    return await ipcRenderer.invoke("create-chat", { appId });
  }

  async deleteChat(chatId: string): Promise<void> {
    return await ipcRenderer.invoke("delete-chat", { chatId });
  }

  async getChats(appId?: string): Promise<any[]> {
    return await ipcRenderer.invoke("get-chats", { appId });
  }

  async checkAppName(params: { appName: string }): Promise<any> {
    return await ipcRenderer.invoke("check-app-name", params);
  }

  async getChatContextResults(params: { appId: string }): Promise<any> {
    return await ipcRenderer.invoke("get-chat-context-results", params);
  }

  async setChatContext(params: { appId: string; chatContext: any }): Promise<void> {
    return await ipcRenderer.invoke("set-chat-context", params);
  }

  async deleteCustomModel(params: { providerId: string; modelApiName: string }): Promise<void> {
    return await ipcRenderer.invoke("delete-custom-model", params);
  }


  async listSupabaseProjects(): Promise<any[]> {
    return await ipcRenderer.invoke("list-supabase-projects");
  }

  async setSupabaseAppProject(projectId: string, appId: string): Promise<void> {
    return await ipcRenderer.invoke("set-supabase-app-project", { projectId, appId });
  }

  async unsetSupabaseAppProject(appId: string): Promise<void> {
    return await ipcRenderer.invoke("unset-supabase-app-project", { appId });
  }

  async disconnectVercelProject(appId: string): Promise<void> {
    return await ipcRenderer.invoke("disconnect-vercel-project", { appId });
  }

  async listVersions(appId: string): Promise<any[]> {
    return await ipcRenderer.invoke("list-versions", { appId });
  }

  async revertVersion(appId: string, params: { appId: number; previousVersionId: string }): Promise<void> {
    return await ipcRenderer.invoke("revert-version", { ...params });
  }

  async getSystemDebugInfo(): Promise<any> {
    return await ipcRenderer.invoke("get-system-debug-info");
  }

  async getChatLogs(params: { chatId: string }): Promise<any> {
    return await ipcRenderer.invoke("get-chat-logs", params);
  }

  async uploadToSignedUrl(params: { url: string; filePath: string }): Promise<void> {
    return await ipcRenderer.invoke("upload-to-signed-url", params);
  }

  async startHelpChat(sessionId: string, message: string, options: any): Promise<void> {
    return await ipcRenderer.invoke("start-help-chat", { sessionId, message, options });
  }

  async selectAppFolder(): Promise<any> {
    return await ipcRenderer.invoke("select-app-folder");
  }

  async checkAiRules(params: { path: string }): Promise<any> {
    return await ipcRenderer.invoke("check-ai-rules", params);
  }

  async importApp(params: { path: string; appName: string; installCommand?: string; startCommand?: string }): Promise<any> {
    return await ipcRenderer.invoke("import-app", params);
  }

  async getNeonProject(params: { appId: string }): Promise<any> {
    return await ipcRenderer.invoke("get-neon-project", params);
  }

  async editAppFile(params: { appId: string; filePath: string; content: string }): Promise<any> {
    return await ipcRenderer.invoke("edit-app-file", params);
  }

  async createAppChat(appId: string): Promise<string> {
    return await ipcRenderer.invoke("create-app-chat", { appId });
  }

  async deleteAppChat(chatId: string): Promise<void> {
    return await ipcRenderer.invoke("delete-app-chat", { chatId });
  }

  async getAppChat(chatId: string): Promise<any> {
    return await ipcRenderer.invoke("get-app-chat", { chatId });
  }

  async startGithubDeviceFlow(appId: string): Promise<void> {
    return await ipcRenderer.invoke("start-github-device-flow", { appId });
  }

  async onGithubDeviceFlowUpdate(callback: (data: any) => void): Promise<void> {
    return await ipcRenderer.invoke("on-github-device-flow-update", { callback });
  }

  async onGithubDeviceFlowSuccess(callback: (data: any) => void): Promise<void> {
    return await ipcRenderer.invoke("on-github-device-flow-success", { callback });
  }

  async onGithubDeviceFlowError(callback: (data: any) => void): Promise<void> {
    return await ipcRenderer.invoke("on-github-device-flow-error", { callback });
  }

  async listGithubRepos(params: { appId: string }): Promise<any[]> {
    return await ipcRenderer.invoke("list-github-repos", params);
  }

  async getGithubRepoBranches(params: { appId: string; repoName: string }): Promise<any[]> {
    return await ipcRenderer.invoke("get-github-repo-branches", params);
  }

  async checkGithubRepoAvailable(params: { appId: string; repoName: string }): Promise<any> {
    return await ipcRenderer.invoke("check-github-repo-available", params);
  }

  async createGithubRepo(params: { appId: string; repoName: string; isPrivate: boolean }): Promise<void> {
    return await ipcRenderer.invoke("create-github-repo", params);
  }

  async connectToExistingGithubRepo(params: { appId: string; repoName: string; branchName: string }): Promise<void> {
    return await ipcRenderer.invoke("connect-to-existing-github-repo", params);
  }

  async disconnectGithubRepo(appId: string): Promise<void> {
    return await ipcRenderer.invoke("disconnect-github-repo", { appId });
  }

  async syncGithubRepo(params: { appId: string }): Promise<any> {
    return await ipcRenderer.invoke("sync-github-repo", params);
  }

  async getVercelProjects(): Promise<any[]> {
    return await ipcRenderer.invoke("get-vercel-projects");
  }

  async setVercelAccessToken(params: { token: string }): Promise<void> {
    return await ipcRenderer.invoke("set-vercel-access-token", params);
  }

  async checkVercelProjectAvailability(params: { name: string }): Promise<any> {
    return await ipcRenderer.invoke("check-vercel-project-availability", params);
  }

  async createVercelProject(params: { name: string; appId: string }): Promise<void> {
    return await ipcRenderer.invoke("create-vercel-project", params);
  }

  async connectVercelProject(params: { projectId: string; appId: string }): Promise<void> {
    return await ipcRenderer.invoke("connect-vercel-project", params);
  }

  async portalMigrateCreate(params: { appId: string }): Promise<any> {
    return await ipcRenderer.invoke("portal-migrate-create", params);
  }

  async fakeHandleNeonConnect(): Promise<void> {
    return await ipcRenderer.invoke("fake-handle-neon-connect");
  }

  async clearSessionData(): Promise<void> {
    return await ipcRenderer.invoke("clear-session-data");
  }

  async onDeepLinkReceived(callback: (data: any) => void): Promise<void> {
    return await ipcRenderer.invoke("on-deep-link-received", { callback });
  }

  // Méthodes manquantes pour corriger les erreurs
  async restartDyad(): Promise<void> {
    return await ipcRenderer.invoke("restart-dyad");
  }

  async isCapacitor(params: { appId: string }): Promise<boolean> {
    return await ipcRenderer.invoke("is-capacitor", params);
  }

  async syncCapacitor(params: { appId: string }): Promise<void> {
    return await ipcRenderer.invoke("sync-capacitor", params);
  }

  async openIos(params: { appId: string }): Promise<void> {
    return await ipcRenderer.invoke("open-ios", params);
  }

  async openAndroid(params: { appId: string }): Promise<void> {
    return await ipcRenderer.invoke("open-android", params);
  }

  async getAppUpgrades(params: { appId: string }): Promise<any[]> {
    return await ipcRenderer.invoke("get-app-upgrades", params);
  }

  async executeAppUpgrade(params: { appId: string; upgradeId: string }): Promise<void> {
    return await ipcRenderer.invoke("execute-app-upgrade", params);
  }

  async cancelChatStream(chatId: string): Promise<void> {
    return await ipcRenderer.invoke("cancel-chat-stream", { chatId });
  }

  async approveProposal(params: { appId: string; proposalId: string }): Promise<void> {
    return await ipcRenderer.invoke("approve-proposal", params);
  }

  async rejectProposal(params: { appId: string; proposalId: string }): Promise<void> {
    return await ipcRenderer.invoke("reject-proposal", params);
  }

  async deleteMessages(params: { chatId: string; messageIds: string[] }): Promise<void> {
    return await ipcRenderer.invoke("delete-messages", params);
  }

  async updateChat(params: { chatId: string; title: string }): Promise<void> {
    return await ipcRenderer.invoke("update-chat", params);
  }

  // Méthodes manquantes pour corriger les erreurs restantes
  async getSystemPlatform(): Promise<string> {
    return await ipcRenderer.invoke("get-system-platform");
  }

  async createNeonProject(params: { appId: string; projectName: string }): Promise<any> {
    return await ipcRenderer.invoke("create-neon-project", params);
  }

  async setAppEnvVars(params: { appId: string; envVars: any[] }): Promise<void> {
    return await ipcRenderer.invoke("set-app-env-vars", params);
  }
}