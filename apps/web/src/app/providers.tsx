"use client";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/(theme)/theme-provider";
import { TooltipProvider } from "@/components/(ui)/tooltip";
import { SearchContextProvider } from "@/context/search";
import { ScrycardsContextProvider } from "react-scrycards";
import { HighlightContextProvider } from "@/context/highlight";
import { EditorContextProvider } from "@/context/editor-settings";

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
                            <EditorContextProvider>
                                <HighlightContextProvider>
                                    {children}
                                </HighlightContextProvider>
                            </EditorContextProvider>
                        </SearchContextProvider>
                    </ScrycardsContextProvider>
                </TooltipProvider>
            </ThemeProvider>
        </>
    );
}
