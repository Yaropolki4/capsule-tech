import { useEffect, useState } from "react";

export const useFetch = <D>(
  request: (signal: AbortSignal) => Promise<D>,
  { onSuccess }: { onSuccess?: (data: D) => void } = {}
) => {
  const [data, setData] = useState<D | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    setIsLoading(true);
    request(signal)
      .then((data) => {
        setData(data);
        onSuccess?.(data);
        setError(null);
      })
      .catch((error) => setError(error))
      .finally(() => setIsLoading(false));

    return () => {
      abortController.abort();
    };
  }, []);

  return { data, isLoading, error };
};
