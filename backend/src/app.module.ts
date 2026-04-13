import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './infra/persistence/prisma/prisma.module';
import { AuthModule } from './application/services/auth/auth.module';
import { TaskListsModule } from './application/services/task-lists/task-lists.module';
import { TasksModule } from './application/services/tasks/tasks.module';
import { HealthModule } from './infra/http/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    TaskListsModule,
    TasksModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
