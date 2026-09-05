import { Gender } from '@prisma/client';

export type CreateUser = {
  name: string;
  fullName: string;
  email: string;
  password?: string;
  gender?: Gender;
  avatarUrl?: string;
};

export type UpdateUser = {
  bio?: string;
  capsulesQuantity?: number;
  avatarUrl?: string;
  fullName?: string;
  name?: string;
};
