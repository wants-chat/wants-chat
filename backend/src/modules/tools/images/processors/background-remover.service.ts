import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BackgroundRemoverService {
  private readonly logger = new Logger(BackgroundRemoverService.name);

  constructor() {
    this.logger.warn('Background removal is currently disabled - package not installed');
  }

  async remove(
    buffer: Buffer,
    outputFormat: 'png' | 'webp' = 'png',
  ): Promise<Buffer> {
    // Background removal is temporarily disabled
    // TODO: Re-enable when @imgly/background-removal-node is properly configured on server
    throw new Error(
      'Background removal feature is temporarily unavailable. Please try again later.',
    );
  }
}
