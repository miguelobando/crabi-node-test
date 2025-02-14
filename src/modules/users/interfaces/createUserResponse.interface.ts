import { User } from 'src/entities/users.entity';

export interface CreateUserResponse {
  success: boolean;
  data: User | null;
  message?: string;
}
