export interface ToolResponse<T = any> {
  data: T;
  message?: string;
  processingTimeMs?: number;
}

export interface FileProcessingResult {
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface ToolUsageLog {
  userId: string;
  toolCategory: string;
  toolName: string;
  inputFileUrl?: string;
  outputFileUrl?: string;
  inputSizeBytes?: number;
  outputSizeBytes?: number;
  processingTimeMs?: number;
  status: 'completed' | 'failed';
  errorMessage?: string;
  metadata?: Record<string, any>;
}
