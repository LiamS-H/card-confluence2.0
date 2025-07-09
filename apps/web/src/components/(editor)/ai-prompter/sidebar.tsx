import { Button } from "@/components/(ui)/button";
import { ChatId, useChatsContext } from "@/context/chat";
import { Layout, Lock, Menu, SquarePen, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AIOpenButton } from "../ai-open-button";
import { getWindowSize } from "@/lib/utils";
import { SimpleToolTip } from "../tooltip";

export function ChatsSidebar({
    activeId,
    emptyChat,
    setActiveChat,
}: {
    activeId: ChatId | null;
    emptyChat: ChatId | null;
    setActiveChat: (chatId: ChatId | null) => void;
}) {
    const { removeChat, chats } = useChatsContext();
    const [_open, setOpen] = useState(false);
    const [hovered, setHovered] = useState(false);
    const open = _open || hovered;

    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function handleClickOutside(event: MouseEvent) {
            if (getWindowSize() !== "xs") return;
            if (
                barRef.current &&
                !barRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    const chatThumbnails = useMemo(() => {
        const chatThumbnails = [];
        for (const [chatId, chat] of chats) {
            if (chatId === emptyChat) continue;
            chatThumbnails.push(
                <li key={chatId} className="relative max-w-full flex">
                    <Button
                        className="rounded-br-none rounded-tr-none w-48"
                        disabled={activeId === chatId || !open}
                        variant={activeId === chatId ? "default" : "ghost"}
                        onClick={() => {
                            setActiveChat(chatId);
                        }}
                    >
                        <span className="overflow-ellipsis overflow-hidden">
                            {chat.name ?? "loading..."}
                        </span>
                    </Button>
                    <Button
                        className="w-8 overflow-ellipsis overflow-hidden rounded-bl-none rounded-tl-none"
                        variant={activeId === chatId ? "destructive" : "ghost"}
                        onClick={() => {
                            if (activeId === chatId) {
                                setActiveChat(null);
                            }
                            removeChat(chatId);
                        }}
                    >
                        <X />
                    </Button>
                </li>
            );
        }
        return chatThumbnails;
    }, [chats, open, activeId, emptyChat, removeChat, setActiveChat]);

    return (
        <div
            className={`${open ? "w-60" : "w-13"} bg-background/60 backdrop-blur-sm h-full absolute sm:static left-0 bottom-0 top-0 z-10 p-2 transition-width duration-300 ease-in-out`}
            onMouseEnter={() => {
                if (window.innerWidth > 640) setHovered(true);
            }}
            onClick={() => {
                if (window.innerWidth < 640 && !open) setHovered(true);
            }}
            onMouseLeave={() => setHovered(false)}
            ref={barRef}
        >
            <div className="flex flex-col gap-4 h-full">
                <ul className={`flex flex-col gap-2`}>
                    <li>
                        <SimpleToolTip
                            text={
                                open ? (_open ? "Close" : "Keep Open") : "Open"
                            }
                        >
                            <Button
                                className="group"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setOpen((prev) => !prev);
                                    setHovered(false);
                                }}
                            >
                                {!open || _open ? (
                                    <Menu />
                                ) : (
                                    <>
                                        <Menu className="group-hover:hidden" />
                                        <Lock className="hidden group-hover:block" />
                                    </>
                                )}
                            </Button>
                        </SimpleToolTip>
                    </li>
                    <li>
                        <Button
                            className="w-full gap-0"
                            disabled={activeId === emptyChat}
                            variant={
                                activeId === emptyChat ? "default" : "ghost"
                            }
                            onClick={(e) => {
                                if (activeId === null) return;
                                e.stopPropagation();
                                setActiveChat(null);
                            }}
                        >
                            <SquarePen />
                            <span className="overflow-ellipsis overflow-hidden">
                                New Chat
                            </span>
                        </Button>
                    </li>
                </ul>

                <ul
                    className={`w-full flex-grow flex flex-col gap-2 my-6 transition-opacity duration-300 overflow-hidden ${
                        open ? "opacity-100" : "opacity-0"
                    }`}
                >
                    {chatThumbnails}
                </ul>
                <div>
                    <AIOpenButton
                        variant={"outline"}
                        className="w-full gap-0 p-3"
                        onClick={() => setOpen(true)}
                    >
                        <Layout />
                        <span className="overflow-ellipsis overflow-hidden">
                            Change View
                        </span>
                    </AIOpenButton>
                </div>
            </div>
        </div>
    );
}
