import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe, Logger } from '@nestjs/common';
import { CustomExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const port = configService.get<number>('PORT') || 3000;
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
  const environment = configService.get<string>('ENVIRONMENT') || 'development';
  const showSwagger = configService.get<string>('SHOW_SWAGGER') === 'true' || environment !== 'production';

  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new CustomExceptionFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  if (showSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Task Management API')
      .setDescription(
        'API REST multi-tenant para gestión de tareas y categorías construida con NestJS, TypeORM y PostgreSQL.',
      )
      .setVersion('1.0')
      .addTag('Auth', 'Endpoints de autenticación y registro')
      .addTag('Categories', 'Gestión de categorías')
      .addTag('Tasks', 'Gestión de tareas')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Ingresa el token JWT sin el prefijo Bearer',
          in: 'header',
        },
        'JWT-auth',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT Refresh Token',
          description: 'Ingresa tu Refresh Token (solo para /auth/refresh)',
          in: 'header',
        },
        'refresh-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    logger.log(`📄 Documentación Swagger lista en: /${apiPrefix}/docs`);
  }

  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Aplicación corriendo en el puerto ${port} [Entorno: ${environment}]`);
}
bootstrap();
