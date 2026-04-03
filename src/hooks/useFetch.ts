import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useFetch<T>(url: string | null): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    axios
      .get<T>(url, { signal: controller.signal })
      .then((res) => {
        setData(res.data);
        setIsLoading(false);
      })
      .catch((err: AxiosError) => {
        if (axios.isCancel(err)) return;
        setError(err.message || 'Something went wrong');
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [url]);

  return { data, isLoading, error };
}
