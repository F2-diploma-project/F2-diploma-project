export interface Env {
  PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string;
}

const DEFAULT_PORT = 3000;

function requireString(raw: Record<string, unknown>, name: string): string {
  const value = raw[name];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}

function parsePort(value: unknown): number {
  if (value === undefined || value === '') return DEFAULT_PORT;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Environment variable PORT must be an integer between 1 and 65535');
  }
  return port;
}

export function validateEnv(raw: Record<string, unknown>): Env {
  return {
    PORT: parsePort(raw.PORT),
    DATABASE_URL: requireString(raw, 'DATABASE_URL'),
    REDIS_URL: requireString(raw, 'REDIS_URL'),
  };
}
