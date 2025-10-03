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
  id: string;
  email: string;
  name: string;
  fullName: string;
  bio: string;
  capsulesQuantity: number;
  avatarUrl?: string;
  followersCount: number;
  followingCount: number;
  isSubscribed: boolean;
};
