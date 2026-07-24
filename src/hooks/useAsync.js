import { useEffect, useState } from "react";

/**
 * Runs an async function (typically a call into src/services/) and tracks
 * its loading/error/data state — the standard pattern for calling a real
 * backend from a component. Re-runs whenever anything in `deps` changes.
 *
 * Usage:
 *   const { data, loading, error } = useAsync(
 *     () => productService.getProduct(id),
 *     [id]
 *   );
 */
export function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    asyncFn()
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

  return state;
}
