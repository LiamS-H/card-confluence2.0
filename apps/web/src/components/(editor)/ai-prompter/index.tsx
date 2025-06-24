import { ChatId, useChatsContext } from "@/context/chat";
import { ICatalog } from "codemirror-lang-scrycards";
import { useEffect, useState } from "react";
import { EditorChat } from "./chat";
import { ChatsSidebar } from "./sidebar";

export function AIPrompter({ catalog }: { catalog: ICatalog }) {
    const { addChat } = useChatsContext();

    const [activeChat, setActiveChat] = useState<ChatId | null>(null);
    const [emptyChat, setEmptyChat] = useState<ChatId | null>(null);

    useEffect(() => {
        if (emptyChat === null && activeChat === null) {
            setEmptyChat(addChat({ name: null, contents: [] }));
        }
    }, [emptyChat, addChat, setEmptyChat, activeChat]);

    const activeId = activeChat ?? emptyChat;

    return (
        <div className="flex w-full bg-background relative">
            <ChatsSidebar
                activeId={activeId}
                emptyChat={emptyChat}
                setActiveChat={setActiveChat}
            />
            {activeId && (
                <EditorChat
                    commitChat={() => {
                        setEmptyChat(null);
                        setActiveChat(activeId);
                    }}
                    catalog={catalog}
                    chatId={activeId}
                />
            )}
        </div>
    );
}
