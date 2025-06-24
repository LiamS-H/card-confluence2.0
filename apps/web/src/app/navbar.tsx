"use client";
import { ThemeToggle } from "@/components/(theme)/theme-toggle";
import { Button } from "@/components/(ui)/button";
import { SimpleToolTip } from "@/components/(ui)/tooltip";
import { useEditorSettingsContext } from "@/context/editor-settings";
import { FileText, Search, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";

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
    const { setOpen } = useEditorSettingsContext();
    const navRef = useRef<HTMLDivElement>(null);

    return (
        <nav ref={navRef} className="fixed z-40 top-0 right-0">
            <ul className="p-4 flex md:flex-row flex-col-reverse items-center gap-4">
                <>
                    <li>
                        <SimpleToolTip text="Settings">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setOpen(true)}
                            >
                                <Settings />
                            </Button>
                        </SimpleToolTip>
                    </li>
                    <li className="hidden md:block">
                        <ThemeToggle />
                    </li>
                    {paths.map((item) => (
                        <NavItem
                            key={item.path}
                            current_path={current_path}
                            item={item}
                        />
                    ))}
                </>
            </ul>
        </nav>
    );
}
