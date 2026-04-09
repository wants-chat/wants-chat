import { api } from '../api';

export interface AIModel {
  id: string;
  modelId?: string;
  name: string;
  displayName?: string;
  description: string;
  provider: string;
  tier: string;
  contextWindow: number;
  maxOutputTokens: number;
  supportsVision: boolean;
  supportsStreaming: boolean;
  costPer1MInput: number;
  costPer1MOutput: number;
}

interface ModelsResponse {
  data: Array<{
    modelId: string;
    displayName: string;
    description: string;
    provider: string;
    contextWindow: number;
    maxOutputTokens: number;
    supportsVision: boolean;
    supportsStreaming: boolean;
    costPer1MInput: number;
    costPer1MOutput: number;
    category?: string;
    tier?: string;
    isDefault?: boolean;
  }>;
}

export const modelsAPI = {
  async getAvailableModels(): Promise<AIModel[]> {
    const res = await api.get<ModelsResponse>('/models');
    return res.data.map((m) => ({
      id: m.modelId,
      modelId: m.modelId,
      name: m.displayName,
      displayName: m.displayName,
      description: m.description,
      provider: m.provider,
      tier: m.tier || 'standard',
      contextWindow: m.contextWindow,
      maxOutputTokens: m.maxOutputTokens,
      supportsVision: m.supportsVision,
      supportsStreaming: m.supportsStreaming,
      costPer1MInput: m.costPer1MInput,
      costPer1MOutput: m.costPer1MOutput,
    }));
  },
};
