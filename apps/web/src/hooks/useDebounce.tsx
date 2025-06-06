import { useEffect, useRef } from "react";

/**
 *
 * @param func a function to call after delay when its reference changes
 * @param delay ms
 * @returns
 */
export function useDebounce(func: () => void, delay: number) {
    const timeoutRef = useRef<NodeJS.Timeout>(undefined);

    useEffect(() => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(func, delay);
    }, [delay, func]);
}
