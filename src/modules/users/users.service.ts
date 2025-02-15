import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './interfaces/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/users.entity';
import { Repository } from 'typeorm';
import { CreateUserResponse } from './interfaces/createUserResponse.interface';
import { LoginDto } from './interfaces/login-user.dto';
import { LoginUserResponse } from './interfaces/loginUserResponse.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwt: JwtService,
  ) {}

  async create(data: CreateUserDto): Promise<CreateUserResponse> {
    const userFound = await this.userRepo.findOneBy({ email: data.email });

    const response: CreateUserResponse = {
      success: false,
      data: null,
    };

    if (userFound) {
      response.message = 'User already created';
      return response;
    }

    const user = this.userRepo.create({
      ...data,
    });

    user.email = user.email.toLowerCase();

    const result = await this.userRepo.save(user);
    response.success = true;
    response.data = result;
    return response;
  }

  async login(data: LoginDto): Promise<LoginUserResponse> {
    const response: LoginUserResponse = {
      id: null,
      firstName: null,
      lastName: null,
      token: null,
    };

    const found = await this.userRepo.findOneBy({
      email: data.email.toLocaleLowerCase(),
    });

    if (found == null) {
      return response;
    }

    const validPassword = await found.validatePassword(data.password);

    if (!validPassword) {
      return response;
    }

    const payload = {
      sub: found.id,
      email: found.email,
    };

    response.firstName = found.firstName;
    response.lastName = found.lastName;
    response.id = found.id;
    response.token = this.jwt.sign(payload);

    return response;
  }

  async getInfo(id: string) {
    const user = await this.userRepo.findOneBy({
      id,
    });

    if (!user) return null;

    // Just to avoid the warning and extra code
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}
