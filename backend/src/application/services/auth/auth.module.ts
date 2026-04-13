import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { AuthController } from '../../../infra/http/auth/auth.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const privateKeyB64 = config.get<string>('JWT_PRIVATE_KEY_BASE64');
        const publicKeyB64 = config.get<string>('JWT_PUBLIC_KEY_BASE64');

        if (!privateKeyB64 || !publicKeyB64) {
          throw new Error(
            'JWT_PRIVATE_KEY_BASE64 and JWT_PUBLIC_KEY_BASE64 environment variables must be set',
          );
        }

        const decodePemKey = (value: string, envName: string): string => {
          const decoded = Buffer.from(value, 'base64').toString('utf-8').trim();
          if (!decoded.includes('-----BEGIN ') || !decoded.includes('-----END ')) {
            throw new Error(`${envName} must contain a valid base64-encoded PEM key`);
          }
          return decoded;
        };

        const privateKey = decodePemKey(privateKeyB64, 'JWT_PRIVATE_KEY_BASE64');
        const publicKey = decodePemKey(publicKeyB64, 'JWT_PUBLIC_KEY_BASE64');

        return {
          privateKey,
          publicKey,
          signOptions: {
            algorithm: 'RS256',
            expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') as StringValue,
          },
        };
      },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
