import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { RegistryController } from './registry.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    AuthModule,
  ],
  controllers: [RegistryController],
})
export class RegistryModule {}
