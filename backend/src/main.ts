import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './lib/filters/all-exceptions.filter';
import { TransformResponseInterceptor } from './lib/interceptors/transform-response.interceptor';
import { JwtAuthGuard } from './lib/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  const configService = app.get(ConfigService);

  // CORS
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS', 'http://localhost:4200');
  await app.register(fastifyCors, {
    origin: allowedOrigins.split(',').map((o) => o.trim()),
    credentials: true,
  });

  // Security headers
  await app.register(fastifyHelmet);

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global guards, filters, interceptors
  app.useGlobalGuards(new JwtAuthGuard(configService));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Todo App API')
    .setDescription('Todo App REST API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`Application running on port ${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('Failed to start application', err);
  process.exit(1);
});
