import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepositoryPort } from '../../ports/users.repository.port';
import { hashPassword, verifyPassword } from '../../../lib/utils/password.util';
import { User } from '../../../domain/user/user.entity';

export interface AuthTokens {
  accessToken: string;
  user: User;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string): Promise<AuthTokens> {
    const existing = await this.usersRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await hashPassword(password);
    const user = await this.usersRepository.create({ email, passwordHash });

    const accessToken = await this.signToken(user.id, user.email);
    return { accessToken, user };
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const userWithPassword = await this.usersRepository.findByEmail(email);
    if (!userWithPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await verifyPassword(password, userWithPassword.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { passwordHash: _, ...user } = userWithPassword;
    const accessToken = await this.signToken(user.id, user.email);
    return { accessToken, user };
  }

  private async signToken(userId: string, email: string): Promise<string> {
    return this.jwtService.signAsync({ sub: userId, email });
  }
}
