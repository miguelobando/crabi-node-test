import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './interfaces/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/users.entity';
import { Repository } from 'typeorm';
import { CreateUserResponse } from './interfaces/createUserResponse.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
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

    const result = await this.userRepo.save(user);
    response.success = true;
    response.data = result;
    return response;
  }
}
