import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: Record<string, unknown>;
}

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new InternalServerErrorException(
        'Contexto de autenticación no disponible',
      );
    }

    return data ? user[data] : user;
  },
);
