import { Button } from "@/components/(ui)/button";
import { ChatId, useChatsContext } from "@/context/chat";
import { ICatalog } from "codemirror-lang-scrycards";
import { useEffect, useMemo, useState } from "react";
import { EditorChat } from "./chat";
import { X } from "lucide-react";

export function AIPrompter({ catalog }: { catalog: ICatalog }) {
    const { addChat, removeChat, chats, nameChat } = useChatsContext();

    const [activeChat, setActiveChat] = useState<ChatId | null>(null);
    const [emptyChat, setEmptyChat] = useState<ChatId | null>(null);

    useEffect(() => {
        if (emptyChat === null && activeChat === null) {
            setEmptyChat(addChat({ name: null, contents: [] }));
        }
    }, [emptyChat, addChat, setEmptyChat, activeChat]);

    const activeId = activeChat ?? emptyChat;

    const chatThumbnails = useMemo(() => {
        const chatThumbnails = [];
        for (const [chatId, chat] of chats) {
            chatThumbnails.push(
                <li key={chatId} className="flex items-center gap-2">
                    {chatId !== emptyChat && (
                        <Button
                            onClick={() => {
                                if (activeId === chatId) {
                                    setActiveChat(null);
                                }
                                removeChat(chatId);
                            }}
                        >
                            <X />
                        </Button>
                    )}
                    <Button
                        className="flex-grow"
                        disabled={activeId === chatId}
                        onClick={() => {
                            setActiveChat(chatId);
                        }}
                    >
                        {chat.name || "New Chat"}
                    </Button>
                </li>
            );
        }
        return chatThumbnails;
    }, [chats, activeId, emptyChat, removeChat]);

    return (
        <div className="flex w-full">
            <div className="flex flex-col gap-2">
                <ul className="flex flex-col gap-2">
                    {chatThumbnails}
                    {!emptyChat && (
                        <li className="w-full">
                            <Button
                                disabled={activeChat === null}
                                onClick={() => {
                                    if (activeChat === null) return;
                                    setActiveChat(null);
                                }}
                            >
                                New Chat
                            </Button>
                        </li>
                    )}
                </ul>
            </div>
            <div className="mr-13 md:mr-0 mt-2 md:mt-0 w-full flex flex-col flex-grow items-center gap-2 bg-background">
                {activeId && (
                    <EditorChat
                        commitChat={() => {
                            setEmptyChat(null);
                            setActiveChat(activeId);
                            nameChat(activeId, "loading...");
                        }}
                        catalog={catalog}
                        chatId={activeId}
                    />
                )}
            </div>
        </div>
    );
}
