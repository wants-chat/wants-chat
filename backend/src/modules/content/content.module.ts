import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    HttpModule.register({
      timeout: 60000,
      maxRedirects: 5,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ContentController],
  providers: [ContentService, AuthGuard],
  exports: [ContentService],
})
export class ContentModule {}
