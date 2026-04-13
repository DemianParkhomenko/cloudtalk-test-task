import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createVerify } from 'crypto';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtPayload } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly publicKey: string;
  private readonly reflector: Reflector;

  constructor(private readonly configService: ConfigService) {
    const publicKeyB64 = this.configService.get<string>('JWT_PUBLIC_KEY_BASE64', '');
    this.publicKey = publicKeyB64 ? Buffer.from(publicKeyB64, 'base64').toString('utf-8') : '';
    this.reflector = new Reflector();
  }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(7);

    try {
      const payload = this.verifyToken(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private verifyToken(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');

    const [headerB64, payloadB64, signatureB64] = parts;
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());

    if (header.alg !== 'RS256') {
      throw new Error('Algorithm not allowed');
    }

    const data = `${headerB64}.${payloadB64}`;
    const signature = Buffer.from(signatureB64, 'base64url');

    const verify = createVerify('RSA-SHA256');
    verify.update(data);
    const isValid = verify.verify(this.publicKey, signature);

    if (!isValid) throw new Error('Invalid signature');

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString()) as JwtPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }

    return payload;
  }
}
