export type TokenBucket = "CHAT" | "PHOTO";

export type TokenBalance = {
  remaining: number;
  limit: number;
  resetAt: string;
};

export type TokenBalances = {
  chat: TokenBalance;
  photo: TokenBalance;
};
