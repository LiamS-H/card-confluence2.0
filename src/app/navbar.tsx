"use client";
import { ThemeToggle } from "@/components/(theme)/theme-toggle";
import { Button } from "@/components/(ui)/button";
import { SimpleToolTip } from "@/components/(ui)/tooltip";
import { FileText, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

interface INavItem {
    path: string;
    name: string;
    icon: ReactNode;
}

const paths: INavItem[] = [
    {
        path: "/",
        name: "Search",
        icon: <Search />,
    },
    {
        path: "/docs",
        name: "Docs",
        icon: <FileText />,
    },
];

function NavItem({
    item: { path, name, icon },
    current_path,
}: {
    item: INavItem;
    current_path: string;
}) {
    const path_active = current_path === path;
    const button = (
        <SimpleToolTip text={name}>
            <Button variant={path_active ? "default" : "outline"} size="icon">
                {icon}
            </Button>
        </SimpleToolTip>
    );
    return (
        <li>
            <Link href={path}>{button}</Link>
        </li>
    );
}

export function NavBar() {
    const current_path = usePathname();
    return (
        <nav className="absolute right-0">
            <ul className="p-2 flex flex-row items-center gap-4">
                <li>
                    <ThemeToggle />
                </li>
                {paths.map((item) => (
                    <NavItem
                        key={item.path}
                        current_path={current_path}
                        item={item}
                    />
                ))}
            </ul>
        </nav>
    );
}
