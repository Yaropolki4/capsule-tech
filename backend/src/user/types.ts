export type CreateUser = {
  name: string;
  fullName: string;
  email: string;
  password: string;
};

export type UpdateUser = {
  bio?: string;
  capsulesQuantity?: number;
  avatarUrl?: string;
  fullName?: string;
  name?: string;
};
