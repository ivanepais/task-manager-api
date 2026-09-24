import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

interface RequestWithUser extends Request {
  user?: Record<string, unknown>;
}

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): unknown => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = req.user;

    if (!user) {
      throw new InternalServerErrorException(
        'Usuario no encontrado en el request (asegúrate de resguardar la ruta con AuthGuard())',
      );
    }

    return data ? user[data] : user;
  },
);
