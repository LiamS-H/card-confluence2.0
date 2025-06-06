"use client";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/(theme)/theme-provider";
import { TooltipProvider } from "@/components/(ui)/tooltip";
import { SearchContextProvider } from "@/context/search";
import { ScrycardsContextProvider } from "react-scrycards";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <TooltipProvider>
                    <ScrycardsContextProvider>
                        <SearchContextProvider>
                            {children}
                        </SearchContextProvider>
                    </ScrycardsContextProvider>
                </TooltipProvider>
            </ThemeProvider>
        </>
    );
}
