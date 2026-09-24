import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'pepe1@ejemplo.com',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  email: string;

  @ApiProperty({
    description:
      'Contraseña de acceso (mín. 8 caracteres, 1 mayúscula, 1 minúscula y 1 número)',
    example: 'Password123!',
    minLength: 8,
    maxLength: 50,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, {
    message: 'La contraseña no puede superar los 50 caracteres',
  })
  @Matches(/(?:(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))/, {
    message:
      'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número',
  })
  password: string;

  @ApiProperty({
    description: 'Nombre de usuario',
    example: 'Pepe',
    minLength: 4,
    maxLength: 30,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  @MinLength(4, {
    message: 'El nombre de usuario debe tener al menos 4 caracteres',
  })
  @MaxLength(30, {
    message: 'El nombre de usuario no puede superar los 30 caracteres',
  })
  userName: string;
}
