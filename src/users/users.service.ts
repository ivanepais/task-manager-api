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

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Registra un nuevo usuario en la base de datos con contraseña encriptada.
   */
  async create(registerUserDto: RegisterUserDto): Promise<User> {
    const { email, password, fullName } = registerUserDto;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Verificación previa de existencia
    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    try {
      // 2. Generar hash de la contraseña (salt = 10)
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3. Crear e instanciar
      const user = this.userRepository.create({
        email: normalizedEmail,
        fullName,
        password: hashedPassword,
      });

      await this.userRepository.save(user);

      // 4. Limpiar datos sensibles del retorno
      delete (user as Partial<User>).password;
      return user;
    } catch (error) {
      // Capturar violaciones de restricción única de Postgres (Race condition)
      if (error.code === '23505') {
        throw new ConflictException('El correo electrónico ya está registrado');
      }

      this.logger.error(`Error al crear usuario: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al registrar el usuario',
      );
    }
  }

  /**
   * Busca un usuario por email incluyendo la contraseña (uso exclusivo de Auth).
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: email.toLowerCase().trim() })
      .addSelect('user.password')
      .getOne();
  }

  /**
   * Busca un usuario activo por su ID (validación de sesiones/guards).
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuario no encontrado o inactivo`);
    }

    return user;
  }
}