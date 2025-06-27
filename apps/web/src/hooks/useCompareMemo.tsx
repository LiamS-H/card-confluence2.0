import { useEffect, useRef, useState } from "react";

export function useCompareMemoDebounced<T>(
    val: T,
    compare?: (v1: T, v2: T) => boolean
): T {
    const [v, setV] = useState<T>(() => val);
    const timeoutRef = useRef<number>(null);

    useEffect(() => {
        if (timeoutRef.current) cancelAnimationFrame(timeoutRef.current);
        timeoutRef.current = requestAnimationFrame(() => {
            setV((old) => (compare ? (compare(old, val) ? old : val) : val));
            timeoutRef.current = null;
        });
    }, [val, compare]);

    return v;
}

export function useCompareMemo<T>(
    val: T,
    compare: (v1: T, v2: T) => boolean
): T {
    const [v, setV] = useState<T>(() => val);

    useEffect(() => {
        setV((old) => (compare(old, val) ? old : val));
    }, [val, compare]);

    return v;
}
