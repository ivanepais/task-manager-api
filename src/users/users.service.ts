import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
    const email = this.normalizeEmail(registerUserDto.email);
    const { password, userName } = registerUserDto;

    const existingUserByEmail = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUserByEmail) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const existingUserByUserName = await this.userRepository.findOne({
      where: { userName },
    });

    if (existingUserByUserName) {
      throw new ConflictException('El nombre de usuario ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    const user = this.userRepository.create({
      email,
      userName,
      password: hashedPassword,
    });

    try {
      const savedUser = await this.userRepository.save(user);

      return this.toResponseDto(savedUser);
    } catch (error: unknown) {
      this.handleDBExceptions(error);
    }
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    const normalizedEmail = this.normalizeEmail(email);

    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: normalizedEmail })
      .addSelect('user.password')
      .getOne();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }

    return user;
  }

  async findByIdOrNull(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findByIdWithRefreshToken(id: string): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .addSelect('user.hashedRefreshToken')
      .getOne();

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async findByIdWithRefreshTokenOrNull(id: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .addSelect('user.hashedRefreshToken')
      .getOne();
  }

  async updateHashedRefreshToken(
    userId: string,
    hashedRefreshToken: string | null,
  ): Promise<void> {
    const result = await this.userRepository.update(userId, {
      hashedRefreshToken,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
  }

  private normalizeEmail(email: string): string {
    return email?.toLowerCase().trim() ?? '';
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      createdAt: user.createdAt,
    };
  }

  private handleDBExceptions(error: unknown): never {
    const pgError = error as {
      message?: string;
      stack?: string;
      driverError?: {
        code?: string;
        constraint?: string;
      };
    };

    if (pgError.driverError?.code === '23505') {
      const constraint = pgError.driverError.constraint;

      if (constraint === 'users_email_unique') {
        throw new ConflictException('El correo electrónico ya está registrado');
      }

      if (constraint === 'users_username_unique') {
        throw new ConflictException('El nombre de usuario ya está registrado');
      }

      this.logger.error(
        `Violación UNIQUE inesperada. Constraint: ${
          constraint ?? 'desconocido'
        }`,
      );

      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al registrar el usuario',
      );
    }

    this.logger.error(
      `Error de base de datos: ${pgError.message ?? 'Error desconocido'}`,
      pgError.stack,
    );

    throw new InternalServerErrorException(
      'Ocurrió un error inesperado al registrar el usuario',
    );
  }
}
