import { PageUserContext } from "./page-user-context";

export function PageUserProvider({
  children,
  pageUser,
}: React.PropsWithChildren<{
  pageUser: string;
}>) {
  return (
    <PageUserContext.Provider value={pageUser}>
      {children}
    </PageUserContext.Provider>
  );
}
