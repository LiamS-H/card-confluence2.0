import { useCallback, useEffect, useRef } from "react";

/**
 *
 * @param func must be memoized as function changes clear debounce timer
 * @param delay ms
 * @returns
 */
export function useDebounce(func: () => void, delay: number) {
    const timeoutRef = useRef<NodeJS.Timeout>(undefined);
    const funcRef = useRef(func);

    useEffect(() => {
        funcRef.current = func;
    }, [delay, func]);

    const debouncedFunction = useCallback(() => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => funcRef.current(), delay);
    }, [delay, funcRef]);

    return debouncedFunction;
}
