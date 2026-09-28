import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';

import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';

import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

const userRepositoryMock = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const bcryptHashMock = jest.spyOn(bcrypt, 'hash') as unknown as jest.Mock<
  Promise<string>,
  [string, number]
>;

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
      ],
    }).compile();
    service = moduleRef.get<UsersService>(UsersService);
    userRepositoryMock.findOne.mockResolvedValue(null);
    bcryptHashMock.mockResolvedValue('hashed-password');
  });

  it('debería crear un usuario correctamente', async () => {
    const registerUserDto = {
      email: 'Pepe@Ejemplo.com',
      password: 'Password123!',
      userName: 'Pepe',
    };

    const user = {
      id: '01999999-9999-7999-8999-999999999999',
      email: 'pepe@ejemplo.com',
      userName: 'Pepe',
      password: 'hashed-password',
      createdAt: new Date(),
    };

    userRepositoryMock.create.mockReturnValue(user);
    userRepositoryMock.save.mockResolvedValue(user);

    const result = await service.create(registerUserDto);

    expect(result).toEqual({
      id: user.id,
      email: user.email,
      userName: user.userName,
      createdAt: user.createdAt,
    });

    expect(userRepositoryMock.create).toHaveBeenCalledWith({
      email: 'pepe@ejemplo.com',
      userName: 'Pepe',
      password: 'hashed-password',
    });

    expect(bcryptHashMock).toHaveBeenCalledWith('Password123!', 10);

    expect(userRepositoryMock.save).toHaveBeenCalledWith(user);

    expect(userRepositoryMock.findOne).toHaveBeenCalledTimes(2);
  });

  it('debería lanzar ConflictException si el email ya está registrado', async () => {
    userRepositoryMock.findOne.mockResolvedValue({
      id: '01999999-9999-7999-8999-999999999999',
      email: 'pepe@ejemplo.com',
      userName: 'Pepe',
    });

    const registerUserDto = {
      email: 'Pepe@Ejemplo.com',
      password: 'Password123!',
      userName: 'Pepe',
    };

    await expect(service.create(registerUserDto)).rejects.toThrow(
      new ConflictException('El correo electrónico ya está registrado'),
    );

    expect(userRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(userRepositoryMock.create).not.toHaveBeenCalled();
    expect(userRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('debería lanzar ConflictException si el nombre de usuario ya está registrado', async () => {
    userRepositoryMock.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: '01999999-9999-7999-8999-999999999999',
        email: 'juan@ejemplo.com',
        userName: 'Pepe',
      });

    const registerUserDto = {
      email: 'Juan@Ejemplo.com',
      password: 'Password123!',
      userName: 'Pepe',
    };

    await expect(service.create(registerUserDto)).rejects.toThrow(
      new ConflictException('El nombre de usuario ya está registrado'),
    );

    expect(userRepositoryMock.findOne).toHaveBeenCalledTimes(2);
    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(userRepositoryMock.create).not.toHaveBeenCalled();
    expect(userRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('debería lanzar ConflictException si PostgreSQL detecta un email duplicado', async () => {
    userRepositoryMock.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const registerUserDto = {
      email: 'Pepe@Ejemplo.com',
      password: 'Password123!',
      userName: 'Pepe',
    };

    const user = {
      id: '01999999-9999-7999-8999-999999999999',
      email: 'pepe@ejemplo.com',
      userName: 'Pepe',
      password: 'hashed-password',
      createdAt: new Date(),
    };

    userRepositoryMock.create.mockReturnValue(user);

    userRepositoryMock.save.mockRejectedValue({
      driverError: {
        code: '23505',
        constraint: 'users_email_unique',
      },
    });

    await expect(service.create(registerUserDto)).rejects.toThrow(
      new ConflictException('El correo electrónico ya está registrado'),
    );

    expect(userRepositoryMock.findOne).toHaveBeenCalledTimes(2);

    expect(bcryptHashMock).toHaveBeenCalledWith('Password123!', 10);

    expect(userRepositoryMock.create).toHaveBeenCalledWith({
      email: 'pepe@ejemplo.com',
      userName: 'Pepe',
      password: 'hashed-password',
    });

    expect(userRepositoryMock.save).toHaveBeenCalledWith(user);
  });

  it('debería lanzar ConflictException si PostgreSQL detecta un username duplicado', async () => {
    userRepositoryMock.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const registerUserDto = {
      email: 'Pepe@Ejemplo.com',
      password: 'Password123!',
      userName: 'Pepe',
    };

    const user = {
      id: '01999999-9999-7999-8999-999999999999',
      email: 'pepe@ejemplo.com',
      userName: 'Pepe',
      password: 'hashed-password',
      createdAt: new Date(),
    };

    userRepositoryMock.create.mockReturnValue(user);

    userRepositoryMock.save.mockRejectedValue({
      driverError: {
        code: '23505',
        constraint: 'users_username_unique',
      },
    });

    await expect(service.create(registerUserDto)).rejects.toThrow(
      new ConflictException('El nombre de usuario ya está registrado'),
    );

    expect(userRepositoryMock.findOne).toHaveBeenCalledTimes(2);

    expect(bcryptHashMock).toHaveBeenCalledWith('Password123!', 10);

    expect(userRepositoryMock.create).toHaveBeenCalledWith({
      email: 'pepe@ejemplo.com',
      userName: 'Pepe',
      password: 'hashed-password',
    });

    expect(userRepositoryMock.save).toHaveBeenCalledWith(user);
  });

  it('debería lanzar InternalServerErrorException ante una violación UNIQUE inesperada', async () => {
    userRepositoryMock.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const registerUserDto = {
      email: 'Pepe@Ejemplo.com',
      password: 'Password123!',
      userName: 'Pepe',
    };

    const user = {
      id: '01999999-9999-7999-8999-999999999999',
      email: 'pepe@ejemplo.com',
      userName: 'Pepe',
      password: 'hashed-password',
      createdAt: new Date(),
    };

    userRepositoryMock.create.mockReturnValue(user);

    userRepositoryMock.save.mockRejectedValue({
      driverError: {
        code: '23505',
        constraint: 'users_some_other_unique',
      },
    });

    await expect(service.create(registerUserDto)).rejects.toThrow(
      new InternalServerErrorException(
        'Ocurrió un error inesperado al registrar el usuario',
      ),
    );

    expect(userRepositoryMock.findOne).toHaveBeenCalledTimes(2);

    expect(bcryptHashMock).toHaveBeenCalledWith('Password123!', 10);

    expect(userRepositoryMock.create).toHaveBeenCalledWith({
      email: 'pepe@ejemplo.com',
      userName: 'Pepe',
      password: 'hashed-password',
    });

    expect(userRepositoryMock.save).toHaveBeenCalledWith(user);
  });

  it('debería lanzar InternalServerErrorException ante un error de base de datos', async () => {
    userRepositoryMock.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const registerUserDto = {
      email: 'Pepe@Ejemplo.com',
      password: 'Password123!',
      userName: 'Pepe',
    };

    const user = {
      id: '01999999-9999-7999-8999-999999999999',
      email: 'pepe@ejemplo.com',
      userName: 'Pepe',
      password: 'hashed-password',
      createdAt: new Date(),
    };

    userRepositoryMock.create.mockReturnValue(user);

    userRepositoryMock.save.mockRejectedValue({
      message: 'Connection terminated unexpectedly',
      stack: 'DatabaseError: Connection terminated unexpectedly',
    });

    await expect(service.create(registerUserDto)).rejects.toThrow(
      new InternalServerErrorException(
        'Ocurrió un error inesperado al registrar el usuario',
      ),
    );

    expect(userRepositoryMock.findOne).toHaveBeenCalledTimes(2);

    expect(bcryptHashMock).toHaveBeenCalledWith('Password123!', 10);

    expect(userRepositoryMock.create).toHaveBeenCalledWith({
      email: 'pepe@ejemplo.com',
      userName: 'Pepe',
      password: 'hashed-password',
    });

    expect(userRepositoryMock.save).toHaveBeenCalledWith(user);
  });

  describe('updateHashedRefreshToken', () => {
    it('debería actualizar el refresh token correctamente', async () => {
      const userId = '01999999-9999-7999-8999-999999999999';
      const hashedRefreshToken = 'hashed-refresh-token';

      userRepositoryMock.update.mockResolvedValue({
        affected: 1,
      });

      await expect(
        service.updateHashedRefreshToken(userId, hashedRefreshToken),
      ).resolves.toBeUndefined();

      expect(userRepositoryMock.update).toHaveBeenCalledWith(userId, {
        hashedRefreshToken,
      });
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      const userId = '01999999-9999-7999-8999-999999999999';
      const hashedRefreshToken = 'hashed-refresh-token';

      userRepositoryMock.update.mockResolvedValue({
        affected: 0,
      });

      await expect(
        service.updateHashedRefreshToken(userId, hashedRefreshToken),
      ).rejects.toThrow(
        new NotFoundException(`Usuario con ID ${userId} no encontrado`),
      );

      expect(userRepositoryMock.update).toHaveBeenCalledWith(userId, {
        hashedRefreshToken,
      });
    });

    it('debería actualizar correctamente con hashedRefreshToken igual a null', async () => {
      const userId = '01999999-9999-7999-8999-999999999999';

      userRepositoryMock.update.mockResolvedValue({
        affected: 1,
      });

      await expect(
        service.updateHashedRefreshToken(userId, null),
      ).resolves.toBeUndefined();

      expect(userRepositoryMock.update).toHaveBeenCalledWith(userId, {
        hashedRefreshToken: null,
      });
    });
  });
});
