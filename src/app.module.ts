import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';

import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    // Carga variables de entorno globalmente
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        ENVIRONMENT: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        // Si no existe en el .env, la app NO arrancará y lanzará una excepción clara
        API_PREFIX: Joi.string().default('api/v1'),

        // Credenciales de PostgreSQL
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
      }),
    }),

    // Conexión asíncrona a la Base de Datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        // Carga automáticamente entidades registradas en módulos hijos
        autoLoadEntities: true,
        // Sincroniza automáticamente cambios de entidades con la BD en desarrollo.
        // 
        synchronize: true, // Solo para desarrollo, en prod usar migraciones
        logging: ['query', 'error'],
      }),
    }),

    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}