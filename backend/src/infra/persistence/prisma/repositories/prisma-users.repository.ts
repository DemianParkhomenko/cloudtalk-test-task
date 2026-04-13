import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UsersRepositoryPort } from '../../../../application/ports/users.repository.port';
import { User, UserWithPassword } from '../../../../domain/user/user.entity';

@Injectable()
export class PrismaUsersRepository implements UsersRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, createdAt: true, updatedAt: true },
    });
  }

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: { email: string; passwordHash: string }): Promise<User> {
    return this.prisma.user.create({
      data,
      select: { id: true, email: true, createdAt: true, updatedAt: true },
    });
  }
}
