import { Button } from "@/components/(ui)/button";
import { Textarea } from "@/components/(ui)/textarea";
import { ICatalog } from "codemirror-lang-scrycards";
import { ChevronDown, LoaderCircle, SendHorizontal } from "lucide-react";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
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
const demoPrompts = [
    {
        line1: "Find cards",
        line2: "like entomb",
        prompt: "Show me cards like entomb.",
    },
    {
        line1: "Combos with",
        line2: "Dr. Eggman",
        prompt: "What cards can combo with my commander Dr. Eggman",
    },
    {
        line1: "Let's play",
        line2: "20 questions",
        prompt: "Think of an iconic card and I'll try and guess it.",
    },
];

export function EditorChat({
    catalog,
    chatId,
    commitChat,
}: {
    catalog: ICatalog;
    chatId: ChatId;
    commitChat: () => void;
}) {
    const [prompt, setPrompt] = useState("");
    const { chat, loading, query } = useChat({
        chatId,
        catalog,
    });

    const scrollRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 5;
        setIsAtBottom(atBottom);
    }, []);

    const scrollToBottom = useCallback(() => {
        const el = scrollRef.current;
        const height = el?.scrollHeight;
        if (!height) return;
        el.scrollTo({ top: height, behavior: "smooth" });
    }, [scrollRef]);

    const processedMessages = useMemo(() => {
        if (!chat?.contents) return [];
        const contents = getContents(chat.contents);
        return processChatContents(contents, loading);
    }, [chat.contents, loading]);

    useEffect(() => {
        if (isAtBottom) {
            requestAnimationFrame(scrollToBottom);
        }
    }, [processedMessages, isAtBottom, scrollToBottom]);

    useEffect(() => {
        if (!loading) {
            if (
                document.activeElement === document.body ||
                document.activeElement === null
            ) {
                textareaRef.current?.focus();
            }
        }
    }, [loading]);

    useEffect(() => {
        handleScroll();
    }, [chatId, handleScroll]);

    const disabled = prompt === "" || loading;

    const doSubmit = async () => {
        if (disabled) return;

        commitChat();
        await query(prompt);
        setPrompt("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await doSubmit();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            doSubmit();
        }
    };

    return (
        <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="w-full h-96 max-h-96 flex justify-center relative overflow-y-auto"
        >
            <div className="w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-13 sm:ml-0">
                <div className="pr-2">
                    <div className="mb-4 px-2">
                        <div className="mb-30" />
                        {processedMessages.length === 0 && !loading && (
                            <div className="mb-4 text-center">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Try an example
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {demoPrompts.map((p, i) => (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            className="h-auto"
                                            onClick={() => {
                                                if (loading) return;

                                                commitChat();
                                                query(p.prompt);
                                            }}
                                        >
                                            <div className="text-left text-sm">
                                                <p className="font-bold">
                                                    {p.line1}
                                                </p>
                                                <p>{p.line2}</p>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
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
                        {!isAtBottom && (
                            <Button
                                onClick={scrollToBottom}
                                variant="outline"
                                className="absolute bottom-28 right-1/2 translate-x-1/2 z-10 rounded-full shadow-lg"
                            >
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Jump to Bottom
                            </Button>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="flex w-full justify-center relative">
                                <Textarea
                                    ref={textareaRef}
                                    disabled={loading}
                                    placeholder="Ask GenAI"
                                    className="min-h-24 flex-grow backdrop-blur-sm"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <Button
                                    className="absolute bottom-4 right-2"
                                    size="icon"
                                    variant={disabled ? "outline" : "highlight"}
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
        </div>
    );
}
