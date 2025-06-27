"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/(ui)/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/(ui)/dropdown-menu";
import { useEffect, useState } from "react";
import { SimpleToolTip } from "../(editor)/tooltip";

export function ThemeToggle(props: Parameters<typeof Button>[0]) {
    const { setTheme, themes, theme } = useTheme();
    const [open, setOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<string | undefined>(theme);

    useEffect(() => {
        if (open) setCurrentTheme(theme);
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <SimpleToolTip text="Change theme">
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" {...props}>
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </DropdownMenuTrigger>
            </SimpleToolTip>
            <DropdownMenuContent align="end">
                {themes.map((theme) => (
                    <DropdownMenuItem
                        key={theme}
                        onClick={() => setTheme(theme)}
                        disabled={theme === currentTheme}
                    >
                        {theme.slice(0, 1).toUpperCase() + theme.slice(1)}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
