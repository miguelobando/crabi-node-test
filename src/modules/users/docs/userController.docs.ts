import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
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

export const GetUserInfoDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user information',
      description:
        "Retrieves the current user's information based on their JWT token",
    }),
    ApiBearerAuth(),
    ApiHeader({
      name: 'Authorization',
      description: 'Bearer JWT token',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'User information retrieved successfully',
      schema: {
        example: {
          id: '12a50a13-10e7-4093-8d15-ed1da6dfce6a',
          firstName: 'miguel',
          lastName: 'lopez',
          email: 'miguel@gmail.com',
          createdAt: '2025-02-15T03:37:23.053Z',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing token',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'User not found',
        },
      },
    }),
  );
};
