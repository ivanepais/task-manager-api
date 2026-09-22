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

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Helper privado para garantizar normalización única e inalterable en todo el servicio
  private normalizeEmail(email: string): string {
    return email?.toLowerCase().trim() ?? '';
  }

  // Registra un nuevo usuario en la base de datos con contraseña encriptada.
  async create(registerUserDto: RegisterUserDto): Promise<User> {
    const email = this.normalizeEmail(registerUserDto.email);
    const { password, userName } = registerUserDto;

    // 1. Verificación previa de existencia (Validación de Negocio)
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    try {
      // 2. Generar hash de la contraseña (salt = 10)
      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

      // 3. Crear e instanciar
      const user = this.userRepository.create({
        email,
        userName,
        password: hashedPassword,
      });

      await this.userRepository.save(user);

      // 4. Sanitización de salida (remover hash del retorno)
      delete (user as Partial<User>).password;
      return user;
    } catch (error) {
      // Tipado seguro de la excepción de Postgres
      const pgError = error as { code?: string; message?: string; stack?: string };

      // Capturar violaciones de restricción única de Postgres (Race conditions)
      if (pgError.code === '23505') {
        throw new ConflictException('El correo electrónico ya está registrado');
      }

      this.logger.error(`Error al crear usuario: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al registrar el usuario',
      );
    }
  }

  // Busca un usuario por email incluyendo la contraseña (uso exclusivo de Auth).
  // Mantiene normalización defensiva al recibir un argumento primitivo.
  async findByEmailWithPassword(email: string): Promise<User | null> {
    const normalizedEmail = this.normalizeEmail(email);
    
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: normalizedEmail })
      .addSelect('user.password')
      .getOne();
  }
  
  // Busca un usuario activo por su ID (validación de sesiones/guards).
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }

    return user;
  }

  // Busca un usuario por ID incluyendo la columna hashedRefreshToken (Uso exclusivo de Auth)
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

  // Gestión interna de sesiones/autenticación: Modifica directamente la columna hashed_refresh_token sin pasar por DTOs públicos.
  async updateHashedRefreshToken(userId: string, hashedRefreshToken: string | null): Promise<void> {
    const result = await this.userRepository.update(userId, {
      hashedRefreshToken,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
  }
}