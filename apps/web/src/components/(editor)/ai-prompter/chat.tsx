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
    catalog: _catalog,
    chatId: _chatId,
    commitChat,
}: {
    catalog: ICatalog;
    chatId: ChatId;
    commitChat: () => void;
}) {
    const [prompt, setPrompt] = useState("");
    const { chat, loading, query } = useChat({
        chatId: _chatId,
        catalog: _catalog,
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
        <div className="w-full h-96 max-h-96 relative overflow-y-auto ml-13 sm:ml-0">
            <div className="pr-2">
                <div className="mb-4 px-2">
                    <div className="mb-30" />
                    <div className="flex flex-col gap-3 ">
                        {processedMessages.map((message) => (
                            <ChatMessage
                                key={message.messageIndex}
                                message={message}
                            />
                        ))}
                        {loading && (
                            <div className="bg-secondary rounded-lg p-3 h-9 w-9 flex items-center justify-center">
                                <LoaderCircle className="animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="sticky bottom-0 w-full bg-linear-to-b from-transparent to-25% to-background/70 py-2">
                    <form onSubmit={handleSubmit}>
                        <div className="flex w-full justify-center relative">
                            <Textarea
                                placeholder="Ask GenAI"
                                className="min-h-24 flex-grow backdrop-blur-sm"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <Button
                                className="absolute bottom-4 right-2"
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
            </div>
        </div>
    );
}
