import { Module } from '@nestjs/common';
import { AppFilesController } from './app-files.controller';
import { AppFilesService } from './app-files.service';

@Module({
  controllers: [AppFilesController],
  providers: [AppFilesService],
  exports: [AppFilesService],
})
export class AppFilesModule {}
