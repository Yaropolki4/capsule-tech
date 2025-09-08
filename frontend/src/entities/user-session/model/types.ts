export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  fullName: string;
  name: string;
};

export type User = {
  email: string;
  name: string;
  fullName: string;
  bio: string;
  capsulesQuantity: number;
  avatarUrl: string | null;
};
