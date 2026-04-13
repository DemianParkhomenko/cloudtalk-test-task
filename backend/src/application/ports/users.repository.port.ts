import { User, UserWithPassword } from '../../domain/user/user.entity';

export abstract class UsersRepositoryPort {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<UserWithPassword | null>;
  abstract create(data: { email: string; passwordHash: string }): Promise<User>;
}
