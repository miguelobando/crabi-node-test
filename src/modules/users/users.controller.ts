import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './interfaces/create-user.dto';
import { PLDService } from './pld.service';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './interfaces/login-user.dto';
import { LoginDocs, RegisterDocs } from './docs/userController.docs';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly pldService: PLDService,
  ) {}

  @Post('/register')
  @RegisterDocs()
  async create(@Body() data: CreateUserDto, @Res() res: Response) {
    try {
      const isBlackListed = await this.pldService.verifyUser({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (isBlackListed) {
        return res.status(HttpStatus.NOT_ACCEPTABLE).json({
          message: 'User Black Listed',
        });
      }

      const result = await this.usersService.create(data);

      if (!result.success) {
        return res.status(HttpStatus.CONFLICT).json(result);
      }

      return res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      throw new HttpException(
        `Server error: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Post('/login')
  @LoginDocs()
  async login(@Body() data: LoginDto, @Res() res: Response) {
    const result = await this.usersService.login(data);

    if (result.id == null) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Invalid credentials',
      });
    }

    return res.status(HttpStatus.OK).json(result);
  }
}
