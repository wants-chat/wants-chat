import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../../ai/ai.service';
import {
  BuildValidatorService,
  BuildError,
  BuildResult,
  FullBuildResult,
} from './build-validator.service';

export interface RepairResult {
  success: boolean;
  file: string;
  error: BuildError;
  originalContent: string;
  repairedContent: string;
  explanation?: string;
}

export interface RepairSessionResult {
  success: boolean;
  attempts: number;
  repairsApplied: number;
  repairsFailed: number;
  repairs: RepairResult[];
  finalBuildResult: FullBuildResult;
}

export interface RepairLog {
  timestamp: Date;
  appId: string;
  platform: string;
  error: BuildError;
  success: boolean;
  attempts: number;
}

@Injectable()
export class AutoRepairService {
  private readonly logger = new Logger(AutoRepairService.name);
  private repairLogs: RepairLog[] = [];

  constructor(
    private readonly aiService: AiService,
    private readonly buildValidator: BuildValidatorService,
  ) {}

  /**
   * Attempt to repair all build errors with retry loop
   */
  async repairWithRetry(
    outputPath: string,
    maxRetries = 3,
    onProgress?: (message: string) => void,
  ): Promise<RepairSessionResult> {
    let attempts = 0;
    let repairsApplied = 0;
    let repairsFailed = 0;
    const allRepairs: RepairResult[] = [];

    let buildResult = await this.buildValidator.validateAll(outputPath);

    if (buildResult.success) {
      this.logger.log('Build already successful, no repairs needed');
      return {
        success: true,
        attempts: 0,
        repairsApplied: 0,
        repairsFailed: 0,
        repairs: [],
        finalBuildResult: buildResult,
      };
    }

    while (attempts < maxRetries && !buildResult.success) {
      attempts++;
      this.logger.log(`Repair attempt ${attempts}/${maxRetries}...`);
      onProgress?.(`Repair attempt ${attempts}/${maxRetries}...`);

      const errors = this.collectAllErrors(buildResult);
      this.logger.log(`Found ${errors.length} errors to fix`);

      if (errors.length === 0) {
        break;
      }

      // Group errors by file to batch repairs
      const errorsByFile = this.groupErrorsByFile(errors);

      for (const [filePath, fileErrors] of errorsByFile) {
        onProgress?.(`Fixing ${fileErrors.length} errors in ${this.getFileName(filePath)}...`);

        const repairResult = await this.repairFile(filePath, fileErrors);

        if (repairResult) {
          allRepairs.push(repairResult);

          if (repairResult.success) {
            repairsApplied++;
            this.logger.log(`Successfully repaired: ${this.getFileName(filePath)}`);
          } else {
            repairsFailed++;
            this.logger.warn(`Failed to repair: ${this.getFileName(filePath)}`);
          }
        }
      }

      // Re-validate after repairs
      buildResult = await this.buildValidator.validateAll(outputPath);

      if (buildResult.success) {
        this.logger.log(`Build successful after ${attempts} attempt(s)`);
        break;
      }

      this.logger.log(`Still ${buildResult.totalErrors} errors remaining after attempt ${attempts}`);
    }

    return {
      success: buildResult.success,
      attempts,
      repairsApplied,
      repairsFailed,
      repairs: allRepairs,
      finalBuildResult: buildResult,
    };
  }

  /**
   * Repair a single file with multiple errors
   */
  async repairFile(
    filePath: string,
    errors: BuildError[],
  ): Promise<RepairResult | null> {
    const originalContent = await this.buildValidator.readFileContent(filePath);

    if (!originalContent) {
      this.logger.error(`Cannot read file: ${filePath}`);
      return null;
    }

    try {
      const repairedContent = await this.generateRepair(
        filePath,
        originalContent,
        errors,
      );

      if (!repairedContent || repairedContent === originalContent) {
        return {
          success: false,
          file: filePath,
          error: errors[0],
          originalContent,
          repairedContent: originalContent,
          explanation: 'No changes generated',
        };
      }

      // Write the repaired content
      const written = await this.buildValidator.writeFileContent(
        filePath,
        repairedContent,
      );

      return {
        success: written,
        file: filePath,
        error: errors[0],
        originalContent,
        repairedContent,
      };
    } catch (error: any) {
      this.logger.error(`Repair failed for ${filePath}:`, error.message);
      return {
        success: false,
        file: filePath,
        error: errors[0],
        originalContent,
        repairedContent: originalContent,
        explanation: error.message,
      };
    }
  }

  /**
   * Generate repaired code using AI
   */
  private async generateRepair(
    filePath: string,
    content: string,
    errors: BuildError[],
  ): Promise<string> {
    const errorDescriptions = errors
      .map((e) => `Line ${e.line}: ${e.code} - ${e.message}`)
      .join('\n');

    const fileExtension = filePath.split('.').pop() || 'ts';
    const isReactFile = fileExtension === 'tsx' || content.includes('import React');
    const isReactNative = content.includes('react-native') || content.includes('expo');

    const prompt = `Fix the following TypeScript${isReactFile ? '/React' : ''}${isReactNative ? ' Native' : ''} errors in this file.

FILE: ${this.getFileName(filePath)}

ERRORS TO FIX:
${errorDescriptions}

CURRENT CODE:
\`\`\`${fileExtension}
${content}
\`\`\`

RULES:
1. Fix ALL the listed errors
2. Keep the existing code structure and logic intact
3. Do NOT add comments explaining the fixes
4. Do NOT change any functionality that isn't broken
5. Preserve all imports and exports
6. If a type is missing, add the correct type annotation
7. If a property doesn't exist, either add it to the interface or use the correct property name
8. For React components, ensure proper typing of props and state
9. Return ONLY the complete fixed code, no explanations

OUTPUT THE COMPLETE FIXED FILE:`;

    const response = await this.aiService.generateText(prompt, {
      model: 'deepseek/deepseek-chat', // Fast & cheap coding model ($0.14/M in, $0.28/M out)
      temperature: 0.1,
      maxTokens: 8000,
      systemMessage: `You are an expert TypeScript/React developer. Your task is to fix code errors.
Return ONLY the fixed code without any markdown formatting, explanations, or code fences.
The output should be valid ${fileExtension} code that can be directly written to a file.`,
    });

    // Clean up the response - remove markdown code fences if present
    let fixedCode = response.trim();

    // Remove markdown code fences
    if (fixedCode.startsWith('```')) {
      const lines = fixedCode.split('\n');
      // Remove first line (```typescript or similar)
      lines.shift();
      // Remove last line if it's closing fence
      if (lines[lines.length - 1]?.trim() === '```') {
        lines.pop();
      }
      fixedCode = lines.join('\n');
    }

    return fixedCode.trim();
  }

  /**
   * Collect all errors from build result
   */
  private collectAllErrors(buildResult: FullBuildResult): BuildError[] {
    const errors: BuildError[] = [];

    if (buildResult.frontend?.errors) {
      errors.push(...buildResult.frontend.errors);
    }
    if (buildResult.backend?.errors) {
      errors.push(...buildResult.backend.errors);
    }
    if (buildResult.mobile?.errors) {
      errors.push(...buildResult.mobile.errors);
    }

    return errors;
  }

  /**
   * Group errors by file path
   */
  private groupErrorsByFile(errors: BuildError[]): Map<string, BuildError[]> {
    const grouped = new Map<string, BuildError[]>();

    for (const error of errors) {
      const existing = grouped.get(error.file) || [];
      existing.push(error);
      grouped.set(error.file, existing);
    }

    return grouped;
  }

  /**
   * Get just the filename from full path
   */
  private getFileName(filePath: string): string {
    return filePath.split('/').pop() || filePath;
  }

  /**
   * Log repair attempt for analysis
   */
  logRepair(appId: string, platform: string, error: BuildError, success: boolean, attempts: number): void {
    this.repairLogs.push({
      timestamp: new Date(),
      appId,
      platform,
      error,
      success,
      attempts,
    });

    // Keep only last 1000 logs in memory
    if (this.repairLogs.length > 1000) {
      this.repairLogs = this.repairLogs.slice(-1000);
    }
  }

  /**
   * Get repair statistics
   */
  getRepairStats(): {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    commonErrors: { code: string; count: number }[];
  } {
    const total = this.repairLogs.length;
    const successful = this.repairLogs.filter((l) => l.success).length;
    const failed = total - successful;

    // Count error codes
    const errorCounts = new Map<string, number>();
    for (const log of this.repairLogs) {
      const count = errorCounts.get(log.error.code) || 0;
      errorCounts.set(log.error.code, count + 1);
    }

    const commonErrors = Array.from(errorCounts.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      commonErrors,
    };
  }
}
