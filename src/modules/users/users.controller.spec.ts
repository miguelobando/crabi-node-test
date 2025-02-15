import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PLDService } from './pld.service';
import { CreateUserDto } from './interfaces/create-user.dto';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { User } from '../../entities/users.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LoginDto } from './interfaces/login-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let pldService: PLDService;

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            login: jest.fn(),
            getInfo: jest.fn(), // Añadimos el mock de getInfo aquí
          },
        },
        {
          provide: PLDService,
          useValue: {
            verifyUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
        JwtAuthGuard,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    pldService = module.get<PLDService>(PLDService);
  });

  describe('Register', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    const mockUser: User = {
      id: '1',
      email: createUserDto.email,
      password: createUserDto.password,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      createdAt: new Date(),
    };

    it('should create a user successfully', async () => {
      const response = mockResponse();
      const serviceResponse = {
        success: true,
        data: mockUser,
      };

      jest.spyOn(pldService, 'verifyUser').mockResolvedValue(false);
      jest.spyOn(usersService, 'create').mockResolvedValue(serviceResponse);

      await controller.create(createUserDto, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(response.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should return NOT_ACCEPTABLE when user is blacklisted', async () => {
      const response = mockResponse();

      jest.spyOn(pldService, 'verifyUser').mockResolvedValue(true);

      await controller.create(createUserDto, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_ACCEPTABLE);
      expect(response.json).toHaveBeenCalledWith({
        message: 'User Black Listed',
      });
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should handle service errors correctly', async () => {
      const response = mockResponse();
      const errorMessage = 'Database connection failed';

      jest
        .spyOn(pldService, 'verifyUser')
        .mockRejectedValue(new Error(errorMessage));

      await expect(
        controller.create(createUserDto, response),
      ).rejects.toThrow();

      try {
        await controller.create(createUserDto, response);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        expect(error.message).toBe(`Server error: ${errorMessage}`);
      }
    });

    it('should handle duplicate user case', async () => {
      const response = mockResponse();
      const serviceResponse = {
        success: false,
        message: 'User already created',
        data: null,
      };

      jest.spyOn(pldService, 'verifyUser').mockResolvedValue(false);
      jest.spyOn(usersService, 'create').mockResolvedValue(serviceResponse);

      await controller.create(createUserDto, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(response.json).toHaveBeenCalledWith(serviceResponse);
    });
  });

  describe('Login', () => {
    const loginDto: LoginDto = {
      email: 'miguel@gmail.com',
      password: 'password123',
    };

    const mockLoginResponse = {
      id: '123',
      firstName: 'miguel',
      lastName: 'obando',
      token: 'asdfasdf',
    };

    it('should login successfully', async () => {
      const response = mockResponse();

      jest.spyOn(usersService, 'login').mockResolvedValue(mockLoginResponse);

      await controller.login(loginDto, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith(mockLoginResponse);
      expect(usersService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should return unauthorized for invalid credentials', async () => {
      const response = mockResponse();
      const invalidLoginResponse = {
        id: null,
        firstName: null,
        lastName: null,
        token: null,
      };

      jest.spyOn(usersService, 'login').mockResolvedValue(invalidLoginResponse);

      await controller.login(loginDto, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(response.json).toHaveBeenCalledWith({
        message: 'Invalid credentials',
      });
      expect(usersService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('getInfo', () => {
    const mockUserResponse = {
      id: '12a50a13-10e7-4093-8d15-ed1da6dfce6a',
      firstName: 'miguel',
      lastName: 'lopez',
      email: 'miguel@gmail.com',
      createdAt: new Date('2025-02-15T03:37:23.053Z'),
    };

    it('should get user info successfully', async () => {
      const mockRequest = {
        user: {
          sub: mockUserResponse.id,
          email: mockUserResponse.email,
        },
      };

      jest.spyOn(usersService, 'getInfo').mockResolvedValue(mockUserResponse);

      const result = await controller.getInfo(mockRequest);

      expect(result).toEqual(mockUserResponse);
      expect(usersService.getInfo).toHaveBeenCalledWith(mockRequest.user.sub);
    });

    it('should return null when user is not found', async () => {
      const mockRequest = {
        user: {
          sub: 'non-existent-id',
          email: 'test@example.com',
        },
      };

      jest.spyOn(usersService, 'getInfo').mockResolvedValue(null);

      const result = await controller.getInfo(mockRequest);

      expect(result).toBeNull();
      expect(usersService.getInfo).toHaveBeenCalledWith(mockRequest.user.sub);
    });
  });
});
