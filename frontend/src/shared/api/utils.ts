export const getAuthorizationHeader = (token: string) => {
  return `Bearer ${token}`;
};
