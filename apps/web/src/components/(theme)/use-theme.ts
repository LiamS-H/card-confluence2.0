"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useLightDark(): "light" | "dark" {
    const { theme, resolvedTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return "dark";

    const out_theme = theme === "system" ? resolvedTheme : theme;

    return out_theme === "dark" ? "dark" : "light";
}
