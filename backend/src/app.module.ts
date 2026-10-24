import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolveClientDir, validateEnv } from './config';
import { DebtorsModule } from './debtors/debtors.module';
import { HealthController } from './health.controller';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { StudentsModule } from './students/students.module';

/** API route prefixes that must never fall through to the React app. */
const API_ROUTES = ['students', 'payments', 'debtors', 'health', 'docs'];

function clientModule(): DynamicModule[] {
  const rootPath = resolveClientDir();
  if (!rootPath) return [];
  return [
    ServeStaticModule.forRoot({
      rootPath,
      exclude: API_ROUTES.map((r) => `/${r}{*rest}`),
    }),
  ];
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    StudentsModule,
    PaymentsModule,
    DebtorsModule,
    ...clientModule(),
  ],
  controllers: [HealthController],
})
export class AppModule {}
