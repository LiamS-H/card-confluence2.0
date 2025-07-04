import type { ProcessedMessage, ProcessedPart } from "../chat";
import { FunctionCallCard } from "./function-call";

export function ChatMessage({ message }: { message: ProcessedMessage }) {
    if (message.parts.length === 0) return null;

    return (
        <div
            className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
        >
            <div
                className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser
                        ? "bg-highlight text-highlight-foreground"
                        : "bg-secondary  text-secondary-foreground"
                }`}
            >
                <div className="text-sm space-y-2">
                    {message.parts.map((part, partIndex) => (
                        <MessagePart key={partIndex} part={part} />
                    ))}
                </div>
            </div>
        </div>
    );
}
export function MessagePart({ part }: { part: ProcessedPart }) {
    if (part.type === "functionCall") {
        return (
            <FunctionCallCard
                functionCall={part.functionCall!}
                functionResponse={part.functionResponse}
            />
        );
    }

    if (part.type === "text") {
        return <div className="whitespace-pre-wrap">{part.content}</div>;
    }

    return null;
}
