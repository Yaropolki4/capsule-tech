export type LoginData = {
  email: string;
  password: string;
};

export type Gender = "MALE" | "FEMALE";

export type RegisterData = {
  email: string;
  password: string;
  name: string;
  gender: Gender;
};

export type User = {
  id: string;
  email: string;
  name: string;
  fullName: string;
  bio: string;
  capsulesQuantity: number;
  avatarUrl?: string;
  gender?: Gender;
  followersCount: number;
  followingCount: number;
  isSubscribed: boolean;
};
