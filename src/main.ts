import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { CustomExceptionFilter } from './common/filters/http-exception.filter'; // Importamos el filtro
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Obtenemos ConfigService del contenedor de dependencias
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1'; //Leer prefijo

  // Aplicar el prefijo global a todas las rutas de la API
  app.setGlobalPrefix(apiPrefix);

  // Activamos la validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // 1. Elimina campos que no estén en el DTO (Saneamiento)
      forbidNonWhitelisted: true, // 2. Lanza un error si el cliente envía campos extra no definidos
      transform: true,            // 3. Transforma tipos automáticamente (ej. '1' a 1)
    }),
  );

  // Activamos el filtro de excepciones global
  app.useGlobalFilters(new CustomExceptionFilter());

  // Configuración de Swagger / OpenAPI
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
      'JWT-auth', // Nombre de la referencia para los decoradores
    )
    .build();

  // Generar el documento OpenAPI
  const document = SwaggerModule.createDocument(app, config);

  // Inicializar la interfaz con
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(port); // Usar la variable 'port' de ConfigService
  console.log(`🚀 Aplicación corriendo en el puerto ${port}`);
  console.log(`📄 Documentación Swagger disponible en: http://localhost:${port}/api/docs`);
}
bootstrap();