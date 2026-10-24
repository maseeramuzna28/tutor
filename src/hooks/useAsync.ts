"use client";

import { useCallback, useEffect, useState } from "react";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  reload: () => () => void;
  setData: (d: T | ((prev: T | null) => T)) => void;
}

export default function useAsync<T>(fn: () => Promise<T>, deps: any[] = []): AsyncState<T> {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: Error | null }>({
    data: null,
    loading: true,
    error: null,
  });

  const run = useCallback(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const cleanup = run();
    return cleanup;
  }, [run]);

  const setData = (d: T | ((prev: T | null) => T)) =>
    setState((s) => ({
      ...s,
      data: typeof d === "function" ? (d as (prev: T | null) => T)(s.data) : d,
    }));

  return { ...state, reload: run, setData };
}
