import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

export function useApi<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}${endpoint}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || 'Failed to fetch');
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [endpoint]);

  return { data, loading, error };
}
