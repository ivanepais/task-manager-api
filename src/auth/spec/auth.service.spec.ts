import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';

import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';

const usersServiceMock = {
  create: jest.fn(),
  findByEmailWithPassword: jest.fn(),
  updateHashedRefreshToken: jest.fn(),
};

const jwtServiceMock = {
  signAsync: jest.fn(),
};

const configServiceMock = {
  getOrThrow: jest.fn(),
};

const bcryptHashMock = jest.spyOn(bcrypt, 'hash') as unknown as jest.Mock<
  Promise<string>,
  [string, number]
>;

const bcryptCompareMock = jest.spyOn(bcrypt, 'compare') as unknown as jest.Mock<
  Promise<boolean>,
  [string, string]
>;

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);

    bcryptHashMock.mockResolvedValue('hashed-refresh-token');
    bcryptCompareMock.mockResolvedValue(true);
  });

  it('debería registrar un usuario correctamente', async () => {
    const registerUserDto = {
      email: 'Pepe@Ejemplo.com',
      password: 'Password123!',
      userName: 'Pepe',
    };

    const user = {
      id: '01999999-9999-7999-8999-999999999999',
      email: 'pepe@ejemplo.com',
      userName: 'Pepe',
      createdAt: new Date(),
    };

    const tokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    usersServiceMock.create.mockResolvedValue(user);

    configServiceMock.getOrThrow.mockImplementation((key: string) => {
      const config = {
        JWT_SECRET: 'access-secret',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_SECRET: 'refresh-secret',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };

      return config[key as keyof typeof config];
    });

    jwtServiceMock.signAsync
      .mockResolvedValueOnce(tokens.accessToken)
      .mockResolvedValueOnce(tokens.refreshToken);

    usersServiceMock.updateHashedRefreshToken.mockResolvedValue(undefined);

    const result = await service.register(registerUserDto);

    expect(result).toEqual({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    expect(usersServiceMock.create).toHaveBeenCalledWith(registerUserDto);

    expect(configServiceMock.getOrThrow).toHaveBeenCalledTimes(4);

    expect(configServiceMock.getOrThrow).toHaveBeenNthCalledWith(
      1,
      'JWT_SECRET',
    );

    expect(configServiceMock.getOrThrow).toHaveBeenNthCalledWith(
      2,
      'JWT_EXPIRES_IN',
    );

    expect(configServiceMock.getOrThrow).toHaveBeenNthCalledWith(
      3,
      'JWT_REFRESH_SECRET',
    );

    expect(configServiceMock.getOrThrow).toHaveBeenNthCalledWith(
      4,
      'JWT_REFRESH_EXPIRES_IN',
    );

    expect(jwtServiceMock.signAsync).toHaveBeenNthCalledWith(
      1,
      {
        id: user.id,
        email: user.email,
      },
      {
        secret: 'access-secret',
        expiresIn: '15m',
      },
    );

    expect(jwtServiceMock.signAsync).toHaveBeenNthCalledWith(
      2,
      {
        id: user.id,
        email: user.email,
      },
      {
        secret: 'refresh-secret',
        expiresIn: '7d',
      },
    );

    expect(bcryptHashMock).toHaveBeenCalledWith(tokens.refreshToken, 10);

    expect(usersServiceMock.updateHashedRefreshToken).toHaveBeenCalledWith(
      user.id,
      'hashed-refresh-token',
    );
  });

  it('debería iniciar sesión correctamente', async () => {
    const loginUserDto = {
      email: 'Pepe@Ejemplo.com',
      password: 'Password123!',
    };

    const user = {
      id: '01999999-9999-7999-8999-999999999999',
      email: 'pepe@ejemplo.com',
      userName: 'Pepe',
      password: 'hashed-password',
      isActive: true,
      createdAt: new Date(),
    };

    const tokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    usersServiceMock.findByEmailWithPassword.mockResolvedValue(user);

    configServiceMock.getOrThrow.mockImplementation((key: string) => {
      const config = {
        JWT_SECRET: 'access-secret',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_SECRET: 'refresh-secret',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };

      return config[key as keyof typeof config];
    });

    jwtServiceMock.signAsync
      .mockResolvedValueOnce(tokens.accessToken)
      .mockResolvedValueOnce(tokens.refreshToken);

    usersServiceMock.updateHashedRefreshToken.mockResolvedValue(undefined);

    const result = await service.login(loginUserDto);

    expect(result).toEqual({
      user: {
        id: user.id,
        email: user.email,
        userName: user.userName,
        createdAt: user.createdAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    expect(usersServiceMock.findByEmailWithPassword).toHaveBeenCalledTimes(1);

    expect(usersServiceMock.findByEmailWithPassword).toHaveBeenCalledWith(
      loginUserDto.email,
    );

    expect(bcryptCompareMock).toHaveBeenCalledTimes(1);

    expect(bcryptCompareMock).toHaveBeenCalledWith(
      loginUserDto.password,
      user.password,
    );

    expect(configServiceMock.getOrThrow).toHaveBeenCalledTimes(4);

    expect(configServiceMock.getOrThrow).toHaveBeenNthCalledWith(
      1,
      'JWT_SECRET',
    );

    expect(configServiceMock.getOrThrow).toHaveBeenNthCalledWith(
      2,
      'JWT_EXPIRES_IN',
    );

    expect(configServiceMock.getOrThrow).toHaveBeenNthCalledWith(
      3,
      'JWT_REFRESH_SECRET',
    );

    expect(configServiceMock.getOrThrow).toHaveBeenNthCalledWith(
      4,
      'JWT_REFRESH_EXPIRES_IN',
    );

    expect(jwtServiceMock.signAsync).toHaveBeenCalledTimes(2);

    expect(jwtServiceMock.signAsync).toHaveBeenNthCalledWith(
      1,
      {
        id: user.id,
        email: user.email,
      },
      {
        secret: 'access-secret',
        expiresIn: '15m',
      },
    );

    expect(jwtServiceMock.signAsync).toHaveBeenNthCalledWith(
      2,
      {
        id: user.id,
        email: user.email,
      },
      {
        secret: 'refresh-secret',
        expiresIn: '7d',
      },
    );

    expect(bcryptHashMock).toHaveBeenCalledTimes(1);

    expect(bcryptHashMock).toHaveBeenCalledWith(tokens.refreshToken, 10);

    expect(usersServiceMock.updateHashedRefreshToken).toHaveBeenCalledTimes(1);

    expect(usersServiceMock.updateHashedRefreshToken).toHaveBeenCalledWith(
      user.id,
      'hashed-refresh-token',
    );
  });
});
