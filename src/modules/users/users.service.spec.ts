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

    const mockUser = {
      id: '1',
      email: createUserDto.email.toLowerCase(),
      password: 'hashed_password',
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      createdAt: new Date(),
      hashPassword: jest.fn(),
      validatePassword: jest.fn(),
    };

    it('should create a new user successfully', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        ...mockUser,
        hashPassword: jest.fn(),
      });
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await usersService.create(createUserDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(result.message).toBeUndefined();
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
      });
    });

    it('should return error when user email already exists', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockUserRepository.create.mockReturnValue({
        ...createUserDto,
        hashPassword: jest.fn(),
      });

      const result = await usersService.create(createUserDto);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe('User already created');
    });

    it('should convert email to lowercase when creating user', async () => {
      const upperCaseEmailDto = {
        ...createUserDto,
        email: 'TEST@EXAMPLE.COM',
      };

      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        ...mockUser,
        email: upperCaseEmailDto.email.toLowerCase(),
        hashPassword: jest.fn(),
      });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        email: upperCaseEmailDto.email.toLowerCase(),
      });

      const result = await usersService.create(upperCaseEmailDto);

      expect(result.success).toBe(true);
      expect(result.data.email).toBe(upperCaseEmailDto.email.toLowerCase());
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
      password: 'hashed_password',
      firstName: 'Test',
      lastName: 'User',
      validatePassword: jest.fn(),
    };

    it('should return user data and token when credentials are valid', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockUser.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mock.jwt.token');

      const result = await usersService.login(loginDto);

      expect(result.id).toBe(mockUser.id);
      expect(result.firstName).toBe(mockUser.firstName);
      expect(result.lastName).toBe(mockUser.lastName);
      expect(result.token).toBe('mock.jwt.token');
      expect(mockUser.validatePassword).toHaveBeenCalledWith(loginDto.password);
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
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockUser.validatePassword.mockResolvedValue(false);

      const result = await usersService.login(loginDto);

      expect(result.id).toBeNull();
      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
      expect(result.token).toBeNull();
      expect(mockUser.validatePassword).toHaveBeenCalledWith(loginDto.password);
    });

    it('should convert email to lowercase when logging in', async () => {
      const upperCaseLoginDto = {
        ...loginDto,
        email: 'TEST@EXAMPLE.COM',
      };

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockUser.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mock.jwt.token');

      await usersService.login(upperCaseLoginDto);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: upperCaseLoginDto.email.toLowerCase(),
      });
    });
  });

  describe('getInfo', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'hashed_password',
      firstName: 'Test',
      lastName: 'User',
      createdAt: new Date(),
    };

    it('should return user info without password', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await usersService.getInfo('1');

      const expectedUser = { ...mockUser };
      delete expectedUser.password;

      expect(result).toEqual(expectedUser);
      expect(result).not.toHaveProperty('password');
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });

    it('should handle when user is not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      const result = await usersService.getInfo('999');

      expect(result).toBeNull();
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: '999' });
    });
  });
});
