import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../entities/users.entity';
import { CreateUserDto } from './interfaces/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './interfaces/login-user.dto';

describe('UsersService', () => {
  let usersService: UsersService;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should create a new user successfully', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(createUserDto);
      mockUserRepository.save.mockResolvedValue({ id: 1, ...createUserDto });

      const result = await usersService.create(createUserDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1, ...createUserDto });
      expect(result.message).toBeUndefined();
    });

    it('should return error when user email already exists', async () => {
      mockUserRepository.findOneBy.mockResolvedValue({
        id: 1,
        ...createUserDto,
      });

      const result = await usersService.create(createUserDto);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe('User already created');
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should return user data and token when credentials are valid', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock.jwt.token');

      const result = await usersService.login(loginDto);

      expect(result.id).toBe(mockUser.id);
      expect(result.firstName).toBe(mockUser.firstName);
      expect(result.lastName).toBe(mockUser.lastName);
      expect(result.token).toBe('mock.jwt.token');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });

    it('should return null values when user is not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      const result = await usersService.login(loginDto);

      expect(result.id).toBeNull();
      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
      expect(result.token).toBeNull();
    });

    it('should return null values when password is incorrect', async () => {
      mockUserRepository.findOneBy.mockResolvedValue({
        ...mockUser,
        password: 'different-password',
      });

      const result = await usersService.login(loginDto);

      expect(result.id).toBeNull();
      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
      expect(result.token).toBeNull();
    });
  });
});
