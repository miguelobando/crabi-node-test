import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto } from '../interfaces/login-user.dto';
import { CreateUserDto } from '../interfaces/create-user.dto';

export const LoginDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'User login',
      description: 'Authenticate a user with email and password',
    }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 200,
      description: 'Login successful',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '123' },
          firstName: { type: 'string', example: 'miguel' },
          lastName: { type: 'string', example: 'obando' },
          token: { type: 'string', example: 'asdfasdf' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Invalid credentials',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Invalid credentials' },
        },
      },
    }),
  );
};

export const RegisterDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create new user' }),
    ApiBody({ type: CreateUserDto }),
    ApiResponse({
      status: 201,
      description: 'User has been successfully created.',
    }),
    ApiResponse({
      status: 406,
      description: 'User is blacklisted.',
    }),
    ApiResponse({
      status: 503,
      description: 'Service unavailable.',
    }),
  );
};
