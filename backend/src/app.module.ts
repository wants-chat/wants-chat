import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ChatModule } from './modules/chat/chat.module';
import { WebSocketModule } from './common/gateways/websocket.module';
import { QdrantModule } from './modules/qdrant/qdrant.module';
import { AiModule } from './modules/ai/ai.module';
import { IntentModule } from './modules/intent/intent.module';
import { ProxyModule } from './modules/proxy/proxy.module';
import { ContentModule } from './modules/content/content.module';
import { ContextModule } from './modules/context/context.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { MemoryModule } from './modules/memory/memory.module';
import { StorageModule } from './modules/storage/storage.module';
import { AppFilesModule } from './modules/app-files/app-files.module';
import { ToolSearchModule } from './modules/tool-search/tool-search.module';
import { BusinessToolsModule } from './modules/business-tools/business-tools.module';
import { ToolDataModule } from './modules/tool-data/tool-data.module';
import { WebModule } from './modules/web/web.module';
import { EmailModule } from './modules/email/email.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { ApiV1Module } from './modules/api-v1/api-v1.module';
import { CustomFieldsModule } from './modules/custom-fields/custom-fields.module';
import { WidgetsModule } from './modules/widgets/widgets.module';
import { GitHubModule } from './modules/app-github/github.module';
import { AppsModule } from './modules/apps/apps.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { ContactModule } from './modules/contact/contact.module';
import { BrowserModule } from './modules/browser/browser.module';
import { DataAnalysisModule } from './modules/data-analysis/data-analysis.module';
import { QueueModule } from './modules/queue/queue.module';
import { DocumentModule } from './modules/document/document.module';
import { ResearchModule } from './modules/research/research.module';
import { LearningModule } from './modules/learning/learning.module';
import { AppBuilderModule } from './modules/app-builder/app-builder.module';
// import { AppCreatorModule } from './modules/app-creator/app-creator.module'; // Commented out — replaced by AppMakerModule
import { AppMakerModule } from './modules/app-maker/app-maker.module';
import { ToolsApiModule } from './modules/tools-api/tools-api.module';
import { ToolsModule } from './modules/tools/tools.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      serveRoot: '/',
      exclude: ['/api*'],
    }),
    DatabaseModule,
    QdrantModule,
    AiModule,
    ProxyModule,
    WebSocketModule,
    AuthModule,
    UsersModule,
    ChatModule,
    IntentModule,
    ContentModule,
    ContextModule,
    OnboardingModule,
    OrganizationModule,
    StripeModule,
    MemoryModule,
    StorageModule,
    AppFilesModule,
    ToolSearchModule,
    BusinessToolsModule,
    ToolDataModule,
    WebModule,
    EmailModule,
    ApiKeysModule,
    ApiV1Module,
    CustomFieldsModule,
    WidgetsModule,
    GitHubModule,
    AppsModule,
    NewsletterModule,
    ContactModule,
    BrowserModule,
    DataAnalysisModule,
    QueueModule,
    DocumentModule,
    ResearchModule,
    LearningModule,
    AppBuilderModule,
    // AppCreatorModule, // Commented out — replaced by AppMakerModule
    AppMakerModule,
    ToolsApiModule,
    ToolsModule,
  ],
})
export class AppModule {}
