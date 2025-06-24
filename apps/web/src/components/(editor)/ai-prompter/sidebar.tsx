import { Button } from "@/components/(ui)/button";
import { ChatId, useChatsContext } from "@/context/chat";
import { Lock, Menu, SquareCode, SquarePen, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AIOpenButton } from "../ai-open-button";

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

    const chatThumbnails = useMemo(() => {
        const chatThumbnails = [];
        for (const [chatId, chat] of chats) {
            if (chatId === emptyChat) continue;
            chatThumbnails.push(
                <li key={chatId} className="relative max-w-full flex">
                    <Button
                        className="rounded-br-none rounded-tr-none flex-grow"
                        disabled={activeId === chatId}
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
                        className="w-7 overflow-ellipsis overflow-hidden rounded-bl-none rounded-tl-none"
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
    }, [chats, activeId, emptyChat, removeChat, setActiveChat]);
    return (
        <div
            className={`${open ? "w-60" : "w-13"} bg-background/60 backdrop-blur-sm h-full absolute sm:static left-0 bottom-0 top-0 z-10 p-2 transition-width duration-300 ease-in-out`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="flex flex-col gap-4 h-full">
                <ul className={`flex flex-col gap-2`}>
                    <li>
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
                    </li>
                    <li>
                        <Button
                            className="w-full gap-0"
                            disabled={activeId === emptyChat}
                            variant={
                                activeId === emptyChat ? "default" : "ghost"
                            }
                            onClick={() => {
                                if (activeId === null) return;
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
                <div className="lg:hidden">
                    <AIOpenButton variant={"outline"} className="w-full gap-0">
                        <SquareCode />
                        <span className="overflow-ellipsis overflow-hidden">
                            Editor Only
                        </span>
                    </AIOpenButton>
                </div>
            </div>
        </div>
    );
}
