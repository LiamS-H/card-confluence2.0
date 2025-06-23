import { Button } from "@/components/(ui)/button";
import { Textarea } from "@/components/(ui)/textarea";
import { ICatalog } from "codemirror-lang-scrycards";
import { LoaderCircle, SendHorizontal } from "lucide-react";
import { useState, useMemo } from "react";
import { useChat } from "./useChat";
import { ChatId } from "@/context/chat";
import { getContents } from "@/lib/utils";
import { FunctionCall, FunctionResponse } from "@google/genai";
import { ChatMessage } from "./chat-message/chat-message";
import { processChatContents } from "./process";

export type ProcessedPart =
    | {
          type: "text";
          content: string;
      }
    | {
          type: "functionCall";
          functionCall: FunctionCall;
          functionResponse?: FunctionResponse | null;
      };

export interface ProcessedMessage {
    messageIndex: number;
    isUser: boolean;
    parts: ProcessedPart[];
}

export function EditorChat({
    addQuery: _addQuery,
    catalog: _catalog,
    chatId: _chatId,
    commitChat,
}: {
    addQuery: (props: { name: string; body: string }) => void;
    catalog: ICatalog;
    chatId: ChatId;
    commitChat: () => void;
}) {
    const [prompt, setPrompt] = useState("");
    const { chat, loading, query } = useChat({
        chatId: _chatId,
        catalog: _catalog,
        addQuery: _addQuery,
    });

    const processedMessages = useMemo(() => {
        if (!chat?.contents) return [];
        const contents = getContents(chat.contents);
        return processChatContents(contents, loading);
    }, [chat, loading]);

    const disabled = prompt === "" || loading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) return;

        commitChat();
        await query(prompt);
        setPrompt("");
    };

    return (
        <div className="w-full relative">
            <div className="flex flex-col gap-3 mb-4 md:mt-13 max-h-96 overflow-y-auto">
                {processedMessages.map((message) => (
                    <ChatMessage key={message.messageIndex} message={message} />
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <Textarea
                        placeholder="Ask GenAI"
                        className="min-h-24 pr-12"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <Button
                        className="absolute bottom-2 right-2"
                        size="icon"
                        variant={disabled ? "outline" : "default"}
                        disabled={disabled}
                        type="submit"
                    >
                        {loading ? (
                            <LoaderCircle className="animate-spin" />
                        ) : (
                            <SendHorizontal />
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
