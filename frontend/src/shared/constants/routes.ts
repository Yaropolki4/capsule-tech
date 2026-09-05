export const routes = {
  register: "/register",
  home: "/",
  getProfile: (userName: string) => `/${userName}`,
  newCapsule: "/capsules/new",
  getCapsule: (id: string) => `/capsules/${id}`,
  wardrobe: "/wardrobe",
  aiStylist: "/ai-stylist",
  getAiStylistThread: (id: string) => `/ai-stylist/${id}`,
  fittingRoom: "/fitting-room",
} as const;

export const publicRoutes = [routes.register] as const;
