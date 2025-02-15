import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'password123',
    description: 'Password from user',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    example: 'miguel@gmail.com',
    description: 'Email from user',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
