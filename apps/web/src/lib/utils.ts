import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
export function mergeObjects<T extends S, S extends object>(
    base: T,
    settings?: S
): T {
    if (!settings) {
        return base;
    }
    //@ts-expect-error Object.keys does not preserve string union types
    const allKeys: Set<keyof T | keyof S> = new Set([
        ...Object.keys(base),
        ...Object.keys(settings),
    ]);
    const merged: T = {} as T;
    Array.from(allKeys).reduce((acc, key) => {
        const v1 = base[key];

        if (v1 !== undefined) {
            //@ts-expect-error since v1 came from key this is valid
            acc[key] = v1;
            return acc;
        }
        //@ts-expect-error accessing key is fine since undefined is handled
        const v2 = settings[key];
        if (v2 !== undefined) {
            acc[key] = v2;
        }
        return acc;
    }, merged);
    return merged;
}

export function getWindowSize(): "xs" | "sm" | "md" | "lg" | "xl" | "2xl" {
    if (typeof window === "undefined") return "sm"; // fallback for SSR

    const width = window.innerWidth;

    if (width >= 1536) return "2xl";
    if (width >= 1280) return "xl";
    if (width >= 1024) return "lg";
    if (width >= 768) return "md";
    if (width >= 640) return "sm";
    return "xs";
}

declare const __brand: unique symbol;
export type Brand<T, K> = T & { [__brand]: K };

export function getContents<T>(val: T | (() => T)) {
    if (typeof val === "function") {
        return (val as () => T)();
    } else return val;
}
