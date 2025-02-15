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
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly pldService: PLDService,
  ) {}

  @Post('/register')
  @ApiOperation({ summary: 'Create new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User has been successfully created.',
  })
  @ApiResponse({
    status: 406,
    description: 'User is blacklisted.',
  })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable.',
  })
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
}
