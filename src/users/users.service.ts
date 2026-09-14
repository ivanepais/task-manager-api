import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Registra un nuevo usuario en la base de datos con contraseña encriptada.
   */
  async create(registerUserDto: RegisterUserDto): Promise<User> {
    const { email, password, fullName } = registerUserDto;

    // 1. Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    try {
      // 2. Generar el hash de la contraseña (salt round = 10)
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3. Crear la instancia de la entidad
      const user = this.userRepository.create({
        email,
        fullName,
        password: hashedPassword,
      });

      // 4. Guardar en PostgreSQL
      await this.userRepository.save(user);

      // 5. Eliminar el hash de la contraseña de la respuesta devuelta
      delete (user as Partial<User>).password;
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        'Ocurrió un error al registrar el usuario',
      );
    }
  }

  /**
   * Busca un usuario por email INCLUYENDO la contraseña (necesario para el Login).
   * Dado que en User entity definimos { select: false }, debemos solicitar el campo explícitamente.
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: email.toLowerCase().trim() })
      .addSelect('user.password')
      .getOne();
  }

  /**
   * Busca un usuario activo por su ID (utilizado por el Guard de JWT para validar sesiones).
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