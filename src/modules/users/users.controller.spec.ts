import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PLDService } from './pld.service';
import { CreateUserDto } from './interfaces/create-user.dto';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { User } from '../../entities/users.entity';

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
          },
        },
        {
          provide: PLDService,
          useValue: {
            verifyUser: jest.fn(),
          },
        },
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
});
