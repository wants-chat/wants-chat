import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppBuilderService } from './app-builder.service';
import { GenerationModule } from './generation/generation.module';
import { RegistryModule } from './registry/registry.module';
import { GenerationService } from './generation/generation.service';
import { DeploymentService } from './services/deployment.service';
import { QdrantAppTypeDetectorService } from './services/qdrant-app-type-detector.service';
import { AiModule } from '../ai/ai.module';
import { AppsModule } from '../apps/apps.module';
import { QdrantModule } from '../qdrant/qdrant.module';

@Module({
  imports: [ConfigModule, GenerationModule, RegistryModule, AiModule, AppsModule, QdrantModule],
  providers: [
    AppBuilderService,
    GenerationService,
    DeploymentService,
    QdrantAppTypeDetectorService,
  ],
  exports: [
    AppBuilderService,
    GenerationService,
    DeploymentService,
    QdrantAppTypeDetectorService,
  ],
})
export class AppBuilderModule {}
