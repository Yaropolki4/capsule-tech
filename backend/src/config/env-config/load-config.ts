import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => {
  return {
    secret: process.env.JWT_SECRET || '',
    accessTokenTtl: process.env.JWT_ACCESS_TOKEN_TTL || '',
    refreshTokenTtl: process.env.JWT_REFRESH_TOKEN_TTL || '',
  };
});

export const postgresConfig = registerAs('postgres', () => {
  return {
    user: process.env.POSTGRES_USER || '',
    password: process.env.POSTGRES_PASSWORD || '',
    database: process.env.POSTGRES_DATABASE || '',
    port: process.env.POSTGRES_PORT || '',
    host: process.env.POSTGRES_HOST || '',
  };
});

export const googleAuthConfig = registerAs('googleAuth', () => {
  return {
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  };
});

export const yandexAuthConfig = registerAs('yandexAuth', () => {
  return {
    yandexClientId: process.env.YANDEX_CLIENT_ID || '',
    yandexCallbackUrl: process.env.YANDEX_CALLBACK_URL || '',
    yandexClientSecret: process.env.YANDEX_CLIENT_SECRET || '',
  };
});

export const s3Config = registerAs('s3', () => {
  return {
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    s3SecretAccessKeyId: process.env.S3_SECRET_ACCESS_KEY_ID || '',
  };
});

export const frontendConfig = registerAs('frontendUrl', () => {
  return {
    url: process.env.FRONTEND_URL || '',
  };
});

export const backendConfig = registerAs('backendUrl', () => {
  return {
    url: process.env.BACKEND_URL || '',
  };
});

export const commonConfig = registerAs('common', () => {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT ? parseInt(process.env.PORT) : 5000,
  };
});

export const cookieConfig = registerAs('cookie', () => {
  return {
    secret: process.env.COOKIE_SECRET || '',
  };
});

export const openrouterConfig = registerAs('openrouter', () => {
  return {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    chatModel: process.env.OPENROUTER_CHAT_MODEL || 'openai/gpt-4.1-mini',
    visionModel:
      process.env.OPENROUTER_VISION_MODEL ||
      process.env.OPENROUTER_CHAT_MODEL ||
      'openai/gpt-4.1-mini',
    imageModel:
      process.env.OPENROUTER_IMAGE_MODEL ||
      'google/gemini-2.5-flash-image-preview',
    embeddingModel:
      process.env.OPENROUTER_EMBEDDING_MODEL || 'google/gemini-embedding-2',
    embeddingDimensions: process.env.EMBEDDING_DIMENSIONS
      ? parseInt(process.env.EMBEDDING_DIMENSIONS, 10)
      : 1536,
  };
});
