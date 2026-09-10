import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        ENVIRONMENT: Joi.string().valid('development', 'production', 'test').default('development'),
        // Si no existe en el .env, la app NO arrancará y lanzará una excepción clara
        API_PREFIX: Joi.string().default('api/v1'), // Incluida en la validación
      }),
    }),
    TasksModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
