import { useEffect, useState } from 'react';
import { api } from './api.js';

export function useFetch(loader, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    loader()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((e) => !cancelled && setState({ data: null, loading: false, error: e.message }));
    return () => { cancelled = true; };
  }, deps);
  return state;
}

export const useProducts = () => useFetch(api.products, []);
