#!/bin/bash

# Fix all module files to use ConfigService for JWT configuration

modules=(
  "src/modules/blog/blog.module.ts"
  "src/modules/language/language.module.ts"
  "src/modules/recipes/recipes.module.ts"
  "src/modules/fitness/fitness.module.ts"
  "src/modules/currency/currency.module.ts"
)

for module in "${modules[@]}"; do
  echo "Fixing $module..."
  
  # Check if ConfigModule and ConfigService are already imported
  if ! grep -q "import.*ConfigModule.*from.*@nestjs/config" "$module"; then
    # Add the import after the JwtModule import
    sed -i '' "/import.*JwtModule.*from.*@nestjs\/jwt/a\\
import { ConfigModule, ConfigService } from '@nestjs/config';" "$module"
  fi
  
  # Replace JwtModule.register with JwtModule.registerAsync
  sed -i '' '/JwtModule.register({/,/}),/ {
    s/JwtModule.register({/JwtModule.registerAsync({/
    s/secret: process.env.JWT_SECRET || .your-secret-key.,/imports: [ConfigModule],\
      useFactory: async (configService: ConfigService) => ({\
        secret: configService.get('\''JWT_SECRET'\''),/
    s/signOptions: { expiresIn: .24h. },/signOptions: {\
          expiresIn: configService.get('\''JWT_EXPIRES_IN'\'') || '\''7d'\'',\
        },\
      }),\
      inject: [ConfigService],/
  }' "$module"
  
done

echo "All modules updated!"