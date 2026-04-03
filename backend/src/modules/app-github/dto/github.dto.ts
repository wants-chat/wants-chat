import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConnectGitHubDto {
  @ApiProperty({ description: 'GitHub installation ID from OAuth callback' })
  @IsString()
  installationId: string;

  @ApiPropertyOptional({ description: 'GitHub access token' })
  @IsString()
  @IsOptional()
  accessToken?: string;
}

export class CreateRepoDto {
  @ApiProperty({ description: 'Repository name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Repository description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether repo should be private', default: true })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}

export class PushToGitHubDto {
  @ApiProperty({ description: 'App ID to push' })
  @IsString()
  appId: string;

  @ApiPropertyOptional({ description: 'Repository owner (defaults to authenticated user)' })
  @IsString()
  @IsOptional()
  repoOwner?: string;

  @ApiPropertyOptional({ description: 'Repository name (defaults to app name)' })
  @IsString()
  @IsOptional()
  repoName?: string;

  @ApiPropertyOptional({ description: 'Branch name', default: 'main' })
  @IsString()
  @IsOptional()
  branch?: string;

  @ApiPropertyOptional({ description: 'Commit message' })
  @IsString()
  @IsOptional()
  commitMessage?: string;

  @ApiPropertyOptional({ description: 'Create repo if it does not exist', default: true })
  @IsBoolean()
  @IsOptional()
  createIfNotExists?: boolean;
}

export class PullFromGitHubDto {
  @ApiProperty({ description: 'App ID to pull into' })
  @IsString()
  appId: string;

  @ApiProperty({ description: 'Repository owner' })
  @IsString()
  repoOwner: string;

  @ApiProperty({ description: 'Repository name' })
  @IsString()
  repoName: string;

  @ApiPropertyOptional({ description: 'Branch name', default: 'main' })
  @IsString()
  @IsOptional()
  branch?: string;
}

export class GitHubRepoDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  owner: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  isPrivate: boolean;

  @ApiProperty()
  defaultBranch: string;

  @ApiProperty()
  htmlUrl: string;

  @ApiProperty()
  cloneUrl: string;
}

export class GitHubConnectionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  githubId: string;

  @ApiProperty()
  githubLogin: string;

  @ApiPropertyOptional()
  githubName?: string;

  @ApiPropertyOptional()
  githubEmail?: string;

  @ApiPropertyOptional()
  githubAvatar?: string;

  @ApiProperty()
  installationId: string;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  lastSyncedAt?: string;

  @ApiProperty()
  createdAt: string;
}

export class GitHubSyncStatusDto {
  @ApiProperty()
  appId: string;

  @ApiPropertyOptional()
  repoOwner?: string;

  @ApiPropertyOptional()
  repoName?: string;

  @ApiPropertyOptional()
  branch?: string;

  @ApiProperty()
  isConnected: boolean;

  @ApiPropertyOptional()
  lastPushedAt?: string;

  @ApiPropertyOptional()
  lastPulledAt?: string;

  @ApiPropertyOptional()
  lastCommitSha?: string;

  @ApiPropertyOptional()
  lastCommitMessage?: string;

  @ApiProperty()
  hasLocalChanges: boolean;

  @ApiProperty()
  hasRemoteChanges: boolean;
}

export class WebhookPayloadDto {
  @ApiProperty()
  action: string;

  @ApiPropertyOptional()
  ref?: string;

  @ApiPropertyOptional()
  repository?: {
    id: number;
    name: string;
    full_name: string;
    owner: { login: string };
  };

  @ApiPropertyOptional()
  sender?: {
    login: string;
    id: number;
  };

  @ApiPropertyOptional()
  commits?: Array<{
    id: string;
    message: string;
    author: { name: string; email: string };
    added: string[];
    removed: string[];
    modified: string[];
  }>;

  @ApiPropertyOptional()
  installation?: {
    id: number;
  };
}

export class AppGitHubLinkDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  appId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  repoOwner: string;

  @ApiProperty()
  repoName: string;

  @ApiProperty()
  repoFullName: string;

  @ApiProperty()
  branch: string;

  @ApiPropertyOptional()
  lastPushedAt?: string;

  @ApiPropertyOptional()
  lastPulledAt?: string;

  @ApiPropertyOptional()
  lastCommitSha?: string;

  @ApiProperty()
  autoSync: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
