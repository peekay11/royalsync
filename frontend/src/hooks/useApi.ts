import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

export function useApi<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiRequest<T>(endpoint)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [endpoint, attempt]);

  return { data, loading, error, refetch: () => setAttempt(value => value + 1) };
}
