import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { GenerationController } from './generation.controller';
import { BatchTestController } from './batch-test.controller';
import { GenerationService } from './generation.service';
import { DeploymentService } from '../services/deployment.service';
import { QdrantAppTypeDetectorService } from '../services/qdrant-app-type-detector.service';
import { AuthModule } from '../../auth/auth.module';
import { AiModule } from '../../ai/ai.module';
import { QdrantModule } from '../../qdrant/qdrant.module';
import { AppsModule } from '../../apps/apps.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    AuthModule,
    AiModule,
    QdrantModule,
    AppsModule,
  ],
  controllers: [GenerationController, BatchTestController],
  providers: [GenerationService, DeploymentService, QdrantAppTypeDetectorService],
  exports: [GenerationService, DeploymentService],
})
export class GenerationModule {}
