export const routes = {
  register: "/register",
  home: "/",
  getProfile: (userName: string) => `/${userName}`,
} as const;

export const publicRoutes = [routes.register] as const;
