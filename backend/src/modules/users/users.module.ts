import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MulterModule.register({
      dest: './uploads',
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
