import { Injectable, Logger } from '@nestjs/common';
import { ToolUsageLog } from '../interfaces/tool-response.interface';

@Injectable()
export class ToolLoggerService {
  private readonly logger = new Logger(ToolLoggerService.name);

  async logToolUsage(log: ToolUsageLog): Promise<void> {
    // Log tool usage to console for now
    // TODO: Implement database logging if needed
    this.logger.log(
      `Tool usage: ${log.toolCategory}/${log.toolName} by user ${log.userId} - ${log.status}`,
    );
    if (log.processingTimeMs) {
      this.logger.debug(`Processing time: ${log.processingTimeMs}ms`);
    }
  }

  async getUserToolHistory(
    userId: string,
    options?: {
      toolCategory?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<any[]> {
    // TODO: Implement database query if needed
    this.logger.warn('getUserToolHistory not yet implemented');
    return [];
  }
}
