import { useCallback, useEffect, useRef } from "react";

/**
 *
 * @param func must be memoized as function changes clear debounce timer
 * @param delay ms
 * @returns
 */
export function useDebounce(func: () => void, delay: number) {
    const timeoutRef = useRef<NodeJS.Timeout>(undefined);

    useEffect(() => {
        clearTimeout(timeoutRef.current);
    }, [delay, func]);

    const debouncedFunction = useCallback(() => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(func, delay);
    }, [delay, func]);

    return debouncedFunction;
}
