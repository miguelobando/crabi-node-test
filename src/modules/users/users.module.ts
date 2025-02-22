import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/users.entity';
import { HttpModule } from '@nestjs/axios';
import { PLDService } from './pld.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PLDService],
  imports: [TypeOrmModule.forFeature([User]), HttpModule, AuthModule],
})
export class UsersModule {}
