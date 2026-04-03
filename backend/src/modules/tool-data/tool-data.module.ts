import { Module, OnModuleInit } from '@nestjs/common';
import { ToolDataController } from './tool-data.controller';
import { ToolDataService } from './tool-data.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [ToolDataController],
  providers: [ToolDataService],
  exports: [ToolDataService],
})
export class ToolDataModule implements OnModuleInit {
  constructor(private readonly toolDataService: ToolDataService) {}

  async onModuleInit() {
    // Initialize the tool_data table in background to not block app startup
    this.toolDataService.initializeTable().catch(err => {
      console.warn('Failed to initialize tool_data table:', err.message);
    });
  }
}
