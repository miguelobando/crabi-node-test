import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../entities/users.entity';
import { CreateUserDto } from './interfaces/create-user.dto';

describe('UsersService', () => {
  let usersService: UsersService;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
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
});
