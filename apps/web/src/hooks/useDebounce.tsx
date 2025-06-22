import { useEffect, useRef, useState } from "react";

/**
 *
 * @param func a function to call after delay when its reference changes
 * @param delay ms
 * @returns
 */
export function useDebounceCallback(func: () => void, delay: number) {
    const timeoutRef = useRef<NodeJS.Timeout>(undefined);

    useEffect(() => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(func, delay);
    }, [delay, func]);
}

export function useDebounceValue<T>(val: T, delay: number): T {
    const [v, setV] = useState<T>(() => val);
    const timeoutRef = useRef<NodeJS.Timeout>(undefined);

    useEffect(() => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(
            () => setV((old) => (old === val ? old : val)),
            delay
        );
    }, [delay, val]);

    return v;
}
