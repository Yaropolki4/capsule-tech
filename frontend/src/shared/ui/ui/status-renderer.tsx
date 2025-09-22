export type Status = "error" | "loading" | "success";

interface StatusRendererProps {
  status: Status;
  error: React.ReactNode;
  loading: React.ReactNode;
}

export const StatusRenderer = ({
  status,
  error,
  loading,
  children,
}: React.PropsWithChildren<StatusRendererProps>) => {
  if (status === "error") {
    return error;
  }

  if (status === "loading") {
    return loading;
  }

  return children;
};
