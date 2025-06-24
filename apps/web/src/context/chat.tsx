import { Brand, getContents } from "@/lib/utils";
import { Content } from "@google/genai";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useState,
} from "react";

export type ChatId = Brand<string, "ChatId">;

export interface Chat {
    id: ChatId;
    name: string | null;
    contents: Content[] | (() => Content[]);
}

export interface ChatsContext {
    removeChat: (chatId: ChatId) => void;
    addChat: (chat: Omit<Chat, "id">) => ChatId;
    // addContents: (chatId: ChatId, contents: Content[]) => Chat["contents"];
    addContents: (chatId: ChatId, contents: Content[]) => void;
    nameChat: (chatId: ChatId, name: string | null) => void;
    chats: Map<ChatId, Chat>;
    children: ReactNode;
}

export const chatsContext = createContext<ChatsContext | null>(null);

export function useChatsContext() {
    const context = useContext(chatsContext);
    if (!context) {
        throw new Error(
            "useChatsContext must be used within a ChatsContextProvider"
        );
    }
    return context;
}

export function ChatsContextProvider({ children }: { children: ReactNode }) {
    const [chats, setChats] = useState<Map<ChatId, Chat>>(() => {
        const chats: ChatsContext["chats"] = new Map();
        chats.set(crypto.randomUUID() as ChatId, {
            id: crypto.randomUUID() as ChatId,
            name: "Welcome",
            contents: [
                {
                    role: "system",
                    parts: [
                        {
                            text: "test",
                        },
                    ],
                },
            ],
        });
        return chats;
    });

    const addChat = useCallback(
        (chat: Omit<Chat, "id">) => {
            const id = crypto.randomUUID() as ChatId;
            setChats((prev) =>
                new Map(prev).set(id, {
                    ...chat,
                    id,
                })
            );
            return id;
        },
        [setChats]
    );

    const removeChat = useCallback(
        (chatId: ChatId) => {
            setChats((prev) => {
                const newChats = new Map(prev);
                newChats.delete(chatId);
                return newChats;
            });
        },
        [setChats]
    );

    const addContents = useCallback(
        (chatId: ChatId, new_contents: Content[]) => {
            // TODO: do something a little better, right now we abuse the fact that we are keeping the list ref the same to preserve memory,
            // which leads to wrapping the contents in a function to force the to ref change, but still allows content mutation mid render
            const chat = chats.get(chatId);
            if (!chat) {
                console.error("valid chats", chats);
                throw Error(`Chat with id ${chatId} not found.`);
            }
            if (typeof chat.contents === "function") {
                chat.contents = chat.contents();
            }
            chat.contents.push(...new_contents);

            setChats((prev) => {
                const newChats = new Map(prev);
                newChats.set(chatId, {
                    ...chat,
                    contents: () => getContents(chat.contents),
                });
                return newChats;
            });
        },
        [setChats, chats]
    );

    const nameChat = useCallback((chatId: ChatId, name: string | null) => {
        setChats((prev) => {
            const newChats = new Map(prev);
            const chat = newChats.get(chatId);
            if (!chat) {
                console.error(`Chat with id ${chatId} not found.`);
                return prev;
            }
            newChats.set(chatId, { ...chat, name });
            return newChats;
        });
    }, []);

    return (
        <chatsContext.Provider
            value={{
                removeChat,
                addChat,
                nameChat,
                chats,
                addContents,
                children,
            }}
        >
            {children}
        </chatsContext.Provider>
    );
}
