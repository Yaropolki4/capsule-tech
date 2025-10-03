import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  JWT_SECRET: z.string(),
  JWT_ACCESS_TOKEN_TTL: z.string(),
  JWT_REFRESH_TOKEN_TTL: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DATABASE: z.string(),
  POSTGRES_PORT: z.string(),
  POSTGRES_HOST: z.string(),
  DATABASE_URI: z.string(),
  FRONTEND_URL: z.string(),
  BACKEND_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY_ID: z.string(),
  CROP_SERVER_URL: z.string(),
});
