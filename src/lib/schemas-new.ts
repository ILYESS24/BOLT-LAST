import { z } from 'zod';

// Schémas de base
export const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  description: z.string().optional(),
  contextWindow: z.number().optional(),
  inputCost: z.number().optional(),
  outputCost: z.number().optional(),
});

export const ProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  apiKeyUrl: z.string().optional(),
  models: z.array(ModelSchema).optional(),
});

export const FileSchema = z.object({
  id: z.string(),
  path: z.string(),
  content: z.string(),
  size: z.number(),
  updatedAt: z.string(),
});

export const AppSchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  path: z.string().optional(),
  description: z.string().optional(),
  files: z.array(FileSchema).optional(),
  githubOrg: z.string().nullable().optional(),
  githubRepo: z.string().nullable().optional(),
  githubBranch: z.string().nullable().optional(),
  githubToken: z.string().nullable().optional(),
  githubInstallationId: z.number().nullable().optional(),
  supabaseProjectId: z.string().nullable().optional(),
  supabaseApiUrl: z.string().nullable().optional(),
  supabaseAnonKey: z.string().nullable().optional(),
  vercelProjectId: z.string().nullable().optional(),
  vercelToken: z.string().nullable().optional(),
  vercelTeamId: z.string().nullable().optional(),
  vercelDeploymentUrl: z.string().nullable().optional(),
  neonDatabaseId: z.string().nullable().optional(),
  neonApiKey: z.string().nullable().optional(),
  neonProjectId: z.string().nullable().optional(),
  lastRun: z.string().nullable().optional(),
  status: z.string().optional(),
  port: z.number().nullable().optional(),
  pid: z.number().nullable().optional(),
  installCommand: z.string().optional(),
  startCommand: z.string().optional(),
});

export const UserSettingsSchema = z.object({
  apiKey: z.string().optional(),
  model: z.string().optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  topP: z.number().optional(),
  frequencyPenalty: z.number().optional(),
  presencePenalty: z.number().optional(),
  enableDynamicSystemPrompt: z.boolean().optional(),
  enableProMode: z.boolean().optional(),
  enableAutoSave: z.boolean().optional(),
  enableAutoRun: z.boolean().optional(),
  enableAutoCommit: z.boolean().optional(),
  enableAutoSync: z.boolean().optional(),
  enableDebugMode: z.boolean().optional(),
  enableTelemetry: z.boolean().optional(),
  enableAnalytics: z.boolean().optional(),
  enableLogging: z.boolean().optional(),
  enableNotifications: z.boolean().optional(),
  enableSounds: z.boolean().optional(),
  theme: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  providerSettings: z.object({
    openai: z.object({
      apiKey: z.object({
        value: z.string(),
        encryptionType: z.string().optional(),
      }).optional(),
      model: z.string().optional(),
      temperature: z.number().optional(),
      maxTokens: z.number().optional(),
      topP: z.number().optional(),
      frequencyPenalty: z.number().optional(),
      presencePenalty: z.number().optional(),
    }).optional(),
    anthropic: z.object({
      apiKey: z.object({
        value: z.string(),
        encryptionType: z.string().optional(),
      }).optional(),
      model: z.string().optional(),
      temperature: z.number().optional(),
      maxTokens: z.number().optional(),
      topP: z.number().optional(),
    }).optional(),
    custom: z.object({
      apiKey: z.object({
        value: z.string(),
        encryptionType: z.string().optional(),
      }).optional(),
      baseUrl: z.string().optional(),
      model: z.string().optional(),
      temperature: z.number().optional(),
      maxTokens: z.number().optional(),
      topP: z.number().optional(),
    }).optional(),
    local: z.object({
      baseUrl: z.string().optional(),
      model: z.string().optional(),
      temperature: z.number().optional(),
      maxTokens: z.number().optional(),
      topP: z.number().optional(),
    }).optional(),
  }).optional(),
  supabase: z.object({
    accessToken: z.string().optional(),
  }).optional(),
  vercel: z.object({
    accessToken: z.string().optional(),
  }).optional(),
  neon: z.object({
    accessToken: z.string().optional(),
  }).optional(),
  stripe: z.object({
    accessToken: z.string().optional(),
  }).optional(),
  dyad: z.object({
    accessToken: z.string().optional(),
  }).optional(),
  dyadProToken: z.string().optional(),
  releaseChannel: z.string().optional(),
  selectedTemplateId: z.string().optional(),
  thinkingBudget: z.enum(["low", "medium", "high"]).optional(),
  proSmartContextOption: z.enum(["balanced", "conservative"]).optional(),
  selectedChatMode: z.enum(['build', 'ask']).optional(),
  enableAutoFixProblems: z.boolean().optional(),
  enableAutoUpdate: z.boolean().optional(),
  autoApprove: z.boolean().optional(),
  githubAccessToken: z.string().optional(),
  selectedModel: z.object({
    id: z.string(),
    name: z.string(),
    provider: z.string(),
  }).optional(),
  enableProSmartFilesContextMode: z.boolean().optional(),
  maxChatTurnsInContext: z.number().optional(),
});

// Types TypeScript dérivés des schémas
export type Model = z.infer<typeof ModelSchema>;
export type Provider = z.infer<typeof ProviderSchema>;
export type App = z.infer<typeof AppSchema>;
export type File = z.infer<typeof FileSchema>;
export type UserSettings = z.infer<typeof UserSettingsSchema>;

// Types pour les propositions et actions
export const ProposalSchema = z.object({
  id: z.string(),
  type: z.enum(["code-proposal", "action-proposal"]),
  title: z.string(),
  description: z.string(),
  filePath: z.string(),
  securityRisks: z.array(z.string()).optional(),
  filesChanged: z.array(z.object({
    name: z.string(),
    path: z.string(),
    summary: z.string(),
    type: z.enum(["create", "modify", "delete"]),
    isServerFunction: z.boolean().optional(),
  })).optional(),
  packagesAdded: z.array(z.string()).optional(),
  sqlQueries: z.array(z.object({
    content: z.string(),
    description: z.string().optional(),
  })).optional(),
});

export const ActionProposalSchema = z.object({
  id: z.string(),
  type: z.literal("action-proposal"),
  actions: z.array(z.any()),
});

export const SuggestedActionSchema = z.object({
  type: z.string(),
  description: z.string(),
  data: z.any().optional(),
});

export const FileChangeSchema = z.object({
  name: z.string(),
  path: z.string(),
  summary: z.string(),
  type: z.enum(["create", "modify", "delete", "code-proposal"]),
  isServerFunction: z.boolean().optional(),
});

export const TokenCountResultSchema = z.object({
  totalTokens: z.number(),
  messageHistoryTokens: z.number(),
  codebaseTokens: z.number(),
  mentionedAppsTokens: z.number(),
  inputTokens: z.number(),
  systemPromptTokens: z.number(),
  contextWindow: z.number(),
});

export const RevertVersionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  successMessage: z.string().optional(),
  warningMessage: z.string().optional(),
});

export const HomeSubmitOptionsSchema = z.object({
  appName: z.string(),
  description: z.string().optional(),
  template: z.string().optional(),
});

export const LargeLanguageModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  contextWindow: z.number().optional(),
  inputCost: z.number().optional(),
  outputCost: z.number().optional(),
});

// Export des types dérivés
export type Proposal = z.infer<typeof ProposalSchema>;
export type ActionProposal = z.infer<typeof ActionProposalSchema>;
export type SuggestedAction = z.infer<typeof SuggestedActionSchema>;
export type FileChange = z.infer<typeof FileChangeSchema>;
export type TokenCountResult = z.infer<typeof TokenCountResultSchema>;
export type RevertVersionResponse = z.infer<typeof RevertVersionResponseSchema>;
export type HomeSubmitOptions = z.infer<typeof HomeSubmitOptionsSchema>;
export type LargeLanguageModel = z.infer<typeof LargeLanguageModelSchema>;

// Types additionnels
export type CodeProposal = Proposal;
export type SqlQuery = {
  content: string;
  description?: string;
};

// Schémas additionnels pour les contextes
export const AppChatContextSchema = z.object({
  appId: z.string(),
  chatId: z.string(),
  contextPaths: z.array(z.object({
    globPath: z.string(),
    excludePaths: z.array(z.string()).optional(),
  })),
  smartContextAutoIncludes: z.array(z.any()),
  excludePaths: z.array(z.string()),
  lastUpdated: z.string(),
});

export const ContextPathResultsSchema = z.object({
  contextPaths: z.array(z.object({
    globPath: z.string(),
    excludePaths: z.array(z.string()).optional(),
  })),
  smartContextAutoIncludes: z.array(z.any()),
  excludePaths: z.array(z.string()),
  lastUpdated: z.string(),
  tokens: z.number().optional(),
});

export const GlobPathSchema = z.object({
  globPath: z.string(),
  excludePaths: z.array(z.string()).optional(),
});

export type AppChatContext = z.infer<typeof AppChatContextSchema>;
export type ContextPathResults = z.infer<typeof ContextPathResultsSchema>;
export type GlobPath = z.infer<typeof GlobPathSchema>;

// Constantes
export const cloudProviders = ['openai', 'anthropic', 'custom', 'local'] as const;

// Interfaces supplémentaires pour les Settings
export interface Settings extends UserSettings {
  autoApprove?: boolean;
  enableAutoUpdate?: boolean;
  selectedChatMode?: 'build' | 'ask';
  githubAccessToken?: string;
  selectedModel?: {
    id: string;
    name: string;
    provider: string;
  };
  enableProSmartFilesContextMode?: boolean;
  maxChatTurnsInContext?: number;
  releaseChannel?: string;
  runtimeMode2?: string;
  vercelAccessToken?: string;
  envVars?: any[];
  refreshSettings?: () => void;
}
