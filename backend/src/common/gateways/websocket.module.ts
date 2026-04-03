import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../../modules/auth/auth.module';
import { AppGateway } from './app.gateway';
import { PresenceService } from './presence.service';

@Module({
  imports: [
    forwardRef(() => AuthModule), // Use forwardRef to avoid circular dependency
  ],
  providers: [AppGateway, PresenceService],
  exports: [AppGateway, PresenceService],
})
export class WebSocketModule {}