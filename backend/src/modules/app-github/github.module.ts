import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GitHubController } from './github.controller';
import { GitHubService } from './github.service';
import { GitHubOAuthService } from './github-oauth.service';
import { AppFilesModule } from '../app-files/app-files.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, AppFilesModule, AuthModule],
  controllers: [GitHubController],
  providers: [GitHubService, GitHubOAuthService],
  exports: [GitHubService, GitHubOAuthService],
})
export class GitHubModule {}
