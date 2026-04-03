import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QdrantService } from './qdrant.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [QdrantService],
  exports: [QdrantService],
})
export class QdrantModule {}
