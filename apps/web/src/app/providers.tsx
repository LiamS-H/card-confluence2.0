import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/(theme)/theme-provider";
import { TooltipProvider } from "@/components/(ui)/tooltip";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <TooltipProvider>{children}</TooltipProvider>
            </ThemeProvider>
        </>
    );
}
