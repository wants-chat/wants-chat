import { Module } from '@nestjs/common';
import { CodeSandboxController } from './code-sandbox.controller';
import { CodeSandboxService } from './code-sandbox.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CodeSandboxController],
  providers: [CodeSandboxService],
  exports: [CodeSandboxService],
})
export class CodeSandboxModule {}
