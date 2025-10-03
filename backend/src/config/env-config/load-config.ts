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

export const s3Config = registerAs('s3', () => {
  return {
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    s3SecretAccessKeyId: process.env.S3_SECRET_ACCESS_KEY_ID || '',
  };
});

export const cropServerUrlConfig = registerAs('cropServerUrl', () => {
  return {
    url: process.env.PYTHON_CROP_SERVER_URL || '',
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
