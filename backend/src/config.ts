import { existsSync } from 'fs';
import { join } from 'path';

export interface Env {
  DATABASE_URL: string;
  PORT: number;
  CORS_ORIGIN?: string;
  CLIENT_DIR: string;
}

/** Validates process env on startup (used by ConfigModule). */
export function validateEnv(raw: Record<string, unknown>): Env {
  const databaseUrl = raw.DATABASE_URL;
  if (typeof databaseUrl !== 'string' || !databaseUrl.startsWith('postgres')) {
    throw new Error('DATABASE_URL is required and must be a postgresql:// connection string');
  }
  const port = Number(raw.PORT ?? 3000);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer');
  }
  return {
    DATABASE_URL: databaseUrl,
    PORT: port,
    CORS_ORIGIN: (raw.CORS_ORIGIN as string) || undefined,
    CLIENT_DIR: (raw.CLIENT_DIR as string) || join(__dirname, '..', 'client'),
  };
}

/** Directory with the built React app, or null when it has not been built (local dev). */
export function resolveClientDir(): string | null {
  const dir = process.env.CLIENT_DIR || join(__dirname, '..', 'client');
  return existsSync(join(dir, 'index.html')) ? dir : null;
}
