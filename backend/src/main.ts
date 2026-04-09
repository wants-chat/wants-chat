const startTime = Date.now();
console.log(`[STARTUP] Script started at ${new Date().toISOString()}`);

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { IoAdapter } from "@nestjs/platform-socket.io";
import * as bodyParser from "body-parser";
import { CamelCaseInterceptor } from "./common/interceptors";

console.log(`[STARTUP] Imports completed in ${Date.now() - startTime}ms`);

async function bootstrap() {
  console.log(`[STARTUP] Bootstrap starting at ${Date.now() - startTime}ms`);
  const app = await NestFactory.create(AppModule);
  console.log(`[STARTUP] NestFactory.create completed in ${Date.now() - startTime}ms`);
  const configService = app.get(ConfigService);

  // Only enable shutdown hooks in production (causes issues with watch mode)
  if (process.env.NODE_ENV === 'production') {
    app.enableShutdownHooks();
  }

  // Configure Socket.IO adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Global interceptor to transform all responses to camelCase
  // This ensures frontend always receives camelCase regardless of backend/DB snake_case
  app.useGlobalInterceptors(new CamelCaseInterceptor());

  // Add health check middleware BEFORE CORS
  app.use("/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "wants-backend",
      version: "1.0.0",
      uptime: process.uptime(),
    });
  });

  // MANUAL CORS MIDDLEWARE - This works reliably
  console.log("🔓 Enabling CORS...");
  app.use((req, res, next) => {
    // Set CORS headers for every response
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin,X-Requested-With,Content-Type,Accept,Authorization,x-api-key,X-Api-Key,x-project-id,X-Project-ID,x-app-id,X-App-ID,x-organization-id,X-Organization-ID"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Max-Age", "86400");

    console.log(
      `📨 ${req.method} ${req.url} from ${req.headers.origin || "no origin"}`
    );

    // Handle preflight OPTIONS requests
    if (req.method === "OPTIONS") {
      console.log("OPTIONS preflight handled");
      return res.status(200).end();
    }

    next();
  });

  console.log("🌐 CORS enabled with manual middleware");

  // API prefix
  const apiPrefix = configService.get("API_PREFIX") || "api/v1";
  app.setGlobalPrefix(apiPrefix);

  if (process.env.NODE_ENV !== "production") {
    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle("Wants API")
      .setDescription("Comprehensive Life Management System API")
      .setVersion("1.0")
      .addBearerAuth()
      .addApiKey({ type: "apiKey", name: "X-API-Key", in: "header" })
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api-docs", app, document);
  }

  const port = configService.get("PORT") || 3001;
  await app.listen(port);

  console.log(`🚀 Wants Backend is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
  console.log(`🌐 API Endpoint: http://localhost:${port}/${apiPrefix}`);
  console.log(`⚡ WebSocket Server: ws://localhost:${port}`);
}

bootstrap();
