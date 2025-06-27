import { ChatId, useChatsContext } from "@/context/chat";
import { Content, GenerateContentResponse } from "@google/genai";
import { useCallback, useMemo, useRef, useState } from "react";
import { queryModel } from "@/lib/ai/model";
import {
    argTypeFromArg,
    completionInfoFromArg,
    detailFromArg,
    ICatalog,
    isArgument,
} from "codemirror-lang-scrycards";
import { fetchSearch } from "@/lib/scryfall";
import { getContents } from "@/lib/utils";
import { useEditorQueriesContext } from "@/context/editor-queries";

const MAX_CALLS = 10;

export function useChatId(chatId: ChatId) {
    const {
        addContents: _addContents,
        chats: _chats,
        removeChat: _removeChat,
        nameChat: _nameChat,
    } = useChatsContext();
    const chat = _chats.get(chatId); // TODO: double check this doesn't change ref when other chats change
    if (!chat) {
        throw Error("Chat not found"); // TODO: Replace with an appropriate error state instead of hard crashing xD
    }

    return useMemo(
        () => ({
            chat: {
                ...chat,
                contents: chat.contents,
            },
            addContents: (contents: Content[]) =>
                _addContents(chatId, contents),
            removeChat: () => _removeChat(chatId),
            nameChat: (name: string) => _nameChat(chatId, name),
        }),
        [chat, _addContents, _removeChat, _nameChat, chatId]
    );
}

let message = 0;
export function useChat({
    chatId,
    catalog,
}: {
    chatId: ChatId;
    catalog: ICatalog;
}) {
    const { addDocQuery } = useEditorQueriesContext();
    const { chat, addContents, removeChat, nameChat } = useChatId(chatId);

    const contents = getContents(chat.contents);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(true);

    const canceledMessages = useRef<Set<number>>(new Set());

    const [poll, setPoll] = useState<{
        question: string;
        cards: string;
    } | null>(null);

    const cancelMessage = useCallback(() => {
        canceledMessages.current.add(message);
        setPoll(null);
    }, []);

    const query = useCallback(
        async (text: string) => {
            console.log("[gemini] invoking commands");
            if (loading) return;
            if (poll !== null) return;
            setLoading(true);
            const curMessage = message++;

            // Always start from the latest chat contents

            function addContent(new_content: Content) {
                console.log("[gemini] adding content", new_content);
                addContents([new_content]);
            }

            const new_content: Content = {
                role: "user",
                parts: [
                    {
                        text,
                    },
                ],
            };
            addContent(new_content);

            let i = 0;
            while (i < MAX_CALLS) {
                i++;
                if (canceledMessages.current.has(curMessage)) {
                    break;
                }
                console.log(
                    "[gemini] querying with contents",
                    contents.map((c) => c)
                );
                const raw = await queryModel(contents);
                if (!raw) {
                    setLoading(false);
                    setError(true);
                    return;
                }
                const resp: GenerateContentResponse = JSON.parse(raw);

                const { candidates } = resp;
                if (!candidates) break;
                const candidate = candidates[0];
                if (!candidate?.content) {
                    break;
                }
                console.log("[gemini] generated:", candidate.content);
                addContent(candidate.content);

                const functionCalls =
                    resp.functionCalls ??
                    candidate.content.parts
                        ?.map((p) => p.functionCall || null)
                        .filter((f) => f !== null);
                if (!functionCalls || functionCalls.length === 0) break;

                for (const func of functionCalls) {
                    console.log(
                        `[gemini] invoking ${func.name}(`,
                        func.args,
                        ")"
                    );
                    switch (func.name) {
                        case "get_tag_info":
                            if (!func.args) break;
                            const { tag, kw } = func.args as {
                                tag: string;
                                kw?: string[];
                            };
                            if (!tag) continue;
                            if (!isArgument(tag)) {
                                addContent({
                                    role: "user",
                                    parts: [
                                        {
                                            functionResponse: {
                                                name: "get_tag_info",
                                                response: {
                                                    error: "tag not recognized.",
                                                },
                                            },
                                        },
                                    ],
                                });
                                continue;
                            }
                            let suggestions = completionInfoFromArg(
                                argTypeFromArg(tag),
                                catalog,
                                {
                                    autoDetail: true,
                                    autoInfo: true,
                                }
                            );
                            if (kw && suggestions) {
                                suggestions = suggestions
                                    .map((s) => {
                                        let score = 0;
                                        kw.forEach((k) => {
                                            if (s.label.includes(k)) {
                                                score++;
                                            }
                                        });
                                        return { ...s, score: score };
                                    })
                                    .filter((s) => s.score > 0)
                                    .sort((a, b) => {
                                        if (b.score !== a.score) {
                                            return b.score - a.score;
                                        }
                                        return a.label.localeCompare(b.label);
                                    });
                            }
                            suggestions?.slice(0, 10);

                            addContent({
                                role: "user",
                                parts: [
                                    {
                                        functionResponse: {
                                            name: "get_tag_info",
                                            response: {
                                                tagInfo: detailFromArg(tag),
                                                values: suggestions,
                                            },
                                        },
                                    },
                                ],
                            });
                            continue;
                        case "add_query":
                            const args = func.args as {
                                name: string;
                                body: string;
                            };
                            addDocQuery(args);
                            if (chat.name === null) {
                                nameChat(args.name);
                            }
                            break;
                        case "get_cards":
                            if (!func.args) break;
                            const { name } = func.args as {
                                name: string;
                            };
                            const resp = await fetchSearch(`${name}`);
                            if (resp.object === "error") {
                                addContent({
                                    role: "user",
                                    parts: [
                                        {
                                            functionResponse: {
                                                name: "get_cards",
                                                response: {
                                                    error: resp.details,
                                                },
                                            },
                                        },
                                    ],
                                });
                                continue;
                            }
                            const cards = resp.data;
                            // TODO: Rank the response based on some string similarity to shorten results
                            // cards.filter(
                            //     (c) => c.name.includes(name) || name.includes(c.name)
                            // );
                            const formatted_cards = cards.map((c) => {
                                if ("card_faces" in c) {
                                    return {
                                        name: c.name,
                                        faces: c.card_faces.map((f) => ({
                                            typeline: f.type_line,
                                            cost: f.mana_cost,
                                            oracle: f.oracle_text,
                                        })),
                                    };
                                }
                                return {
                                    name: c.name,
                                    typeline: c.type_line,
                                    cost: c.mana_cost,
                                    oracle: c.oracle_text,
                                };
                            });
                            console.log(
                                "[gemini] retrieved cards",
                                formatted_cards
                            );
                            addContent({
                                role: "user",
                                parts: [
                                    {
                                        functionResponse: {
                                            name: "get_cards",
                                            response: {
                                                cards: formatted_cards,
                                            },
                                        },
                                    },
                                ],
                            });
                            continue;

                        default:
                            console.error("[gemini] undefined func:", func);
                            break;
                    }
                }
            }
            console.log("[gemini] exiting, query over");

            setLoading(false);
        },
        [
            loading,
            poll,
            contents,
            addDocQuery,
            addContents,
            nameChat,
            catalog,
            chat.name,
        ]
    );

    //TODO: add chat stopping that actually removes / flags messages

    return { chat, poll, loading, error, query, cancelMessage, removeChat };
}
