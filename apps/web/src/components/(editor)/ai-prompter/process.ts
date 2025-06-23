import { Content, FunctionResponse } from "@google/genai";
import { ProcessedMessage, ProcessedPart } from "./chat";

export function processChatContents(
    contents: Content[],
    loading: boolean
): ProcessedMessage[] {
    if (!contents.length) return [];

    const processedMessages: ProcessedMessage[] = [];
    const unmatchedResponses = new Map<string, FunctionResponse>();

    // Process messages in reverse order for function call matching
    for (let i = contents.length - 1; i >= 0; i--) {
        //@ts-expect-error comes from the dimension of the contents
        const content: Content = contents[i];
        const isUser = content.role === "user";
        const processedParts: ProcessedPart[] = [];

        if (!content.parts) {
            processedMessages.unshift({
                messageIndex: i,
                isUser,
                parts: [],
            });
            continue;
        }

        // Process parts in forward order within each message
        for (const part of content.parts) {
            if (!part) continue;

            // Handle function calls
            if (part.functionCall?.name) {
                const functionResponse = unmatchedResponses.get(
                    part.functionCall.name
                );
                if (functionResponse) {
                    unmatchedResponses.delete(part.functionCall.name);
                }
                processedParts.push({
                    type: "functionCall",
                    functionCall: part.functionCall,
                    functionResponse: functionResponse
                        ? functionResponse
                        : loading
                          ? undefined
                          : null,
                });
            }

            // Handle function responses
            if (part.functionResponse?.name) {
                unmatchedResponses.set(
                    part.functionResponse.name,
                    part.functionResponse
                );
            }

            // Handle text content
            if (part.text) {
                processedParts.push({
                    type: "text",
                    content: part.text,
                });
            }
        }

        // Add processed message to the beginning to maintain correct order
        processedMessages.unshift({
            messageIndex: i,
            isUser,
            parts: processedParts,
        });
    }

    return processedMessages;
}
