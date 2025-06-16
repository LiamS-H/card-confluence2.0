"use server";
import {
    ContentListUnion,
    // FunctionCallingConfigMode,
    FunctionDeclaration,
    GoogleGenAI,
    Type,
} from "@google/genai";
import {
    argTypeFromArg,
    completionInfoFromArg,
    detailFromArg,
    ICatalog,
    isArgument,
} from "codemirror-lang-scrycards";
import { fetchSearch, fetchWithHeaders } from "./scryfall";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const get_cards: FunctionDeclaration = {
    name: "get_cards",
    description:
        "look up a card on scryfall with it's name. returns a list of cards.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            name: {
                type: Type.STRING,
            },
        },
        required: ["name"],
    },
};

const add_query: FunctionDeclaration = {
    name: "add_query",
    description: "adds a query to the document.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            name: {
                type: Type.STRING,
            },
            body: {
                type: Type.STRING,
            },
        },
        required: ["name", "body"],
    },
};
// const getDoc: FunctionDeclaration = {
//     name: "get_doc",
//     description: "gets the user's current query document.",
// };
const get_tag_info: FunctionDeclaration = {
    name: "get_tag_info",
    description:
        "get info on an tag, and 10 of its potential values, optionally provide a list of kw to search values.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            tag: {
                type: Type.STRING,
            },
            kw: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
            },
        },
        required: ["tag"],
    },
};

export async function queryAI(prompt: string, catalog: ICatalog) {
    const contents: ContentListUnion = [
        {
            role: "user",
            parts: [{ text: prompt }],
        },
    ];
    while (true) {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: contents,
            config: {
                candidateCount: 1,
                systemInstruction: `
You convert natural language to Scryfall queries.
Scryfall queries are a way to search MTG (Magic The Gathering) cards.
Scryfall queries use a tag syntax [tag][operator][value].
Tags can be grouped into clauses with ()
Arguments are Tags/Clauses
Arguments can be merged with "and" or "or"
"and" is not necessary because all adjacent arguments are implied to be joined with and
Arguments can be negated with "-"
Values can be provided directly like 't:creature'
Values can be provided as string literals using ""
STRING LITERALS CANNOT BE WRITTEN WITH '' 

Assertive tag types: (suitable with ":" or "=" operator)
    - game: "paper" | "mtgo" | "mtga"
    - legal: MTG format name: "commander" | "modern" etc
    - type: MTG card type or creature/supertype "t:elf" | "t:srocery" etc
    - oracle: MTG card rules text, ~ can be used to represent generically the name of the card, also searchable with RegExp like o://
    - set: MTG card set or set code
    - kw: Keywords "flying" | "reach" etc
    - otag: open source function tags
    - atag: open source art tags
    - is: limited hard coded card attributes "is:commander" | "is:firstprinting" etc
Numerical (suitable with numerical operator ">" "<=" etc)
    - id: Color identity "rgu" | "temur" etc
    - mana: mana used to cast the spell "2b" | "{g}{g/r}"
    - cmc: converted mana costs

Tips:
when searching for the behavior of card, avoid o:"card text" queries as language can vary, first try using the get_tag_info function to make searches into otag: or is: .
when using get_tag_info on otag: words like "search" become "tutor", and "destroy" | "exile" becomes "removal"
if you must use o:"long card text", try splittnig it up to capture less statically or using RegExp.
when a user asks for cards like another card you don't know, start by looking up that card with the get_cards function. 

Output:
Avoid explanations or questions, if unsure apply multiple clauses with or.
NEVER PUT QUERIES AS TEXT, instead end with a function call to add_query to write the query instead of writing directly.
`,
                // toolConfig: {
                //     functionCallingConfig: {
                //         mode: FunctionCallingConfigMode.AUTO,
                //     },
                // },
                // maxOutputTokens: 2000,
                tools: [
                    {
                        functionDeclarations: [
                            add_query,
                            get_tag_info,
                            get_cards,
                        ],
                    },
                ],
            },
        });
        console.log("[gemini]", response);

        if (!response.functionCalls || !response.candidates) {
            return {
                text: response.text,
                func: response.functionCalls,
            };
        }
        const candidate = response.candidates[0];
        if (!candidate?.content) {
            return null;
        }
        contents.push(candidate.content);

        for (const func of response.functionCalls) {
            switch (func.name) {
                case "get_tag_info":
                    console.log("[gemini] get_tag_info", func.args);
                    if (!func.args) break;
                    const { tag, kw } = func.args as {
                        tag: string;
                        kw?: string[];
                    };
                    if (!tag) continue;
                    if (!isArgument(tag)) {
                        contents.push({
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
                        catalog
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

                    contents.push({
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
                    return {
                        text: response.text,
                        func,
                    };
                case "get_cards":
                    console.log("[gemini] get_cards", func.args);
                    if (!func.args) break;
                    const { name } = func.args as {
                        name: string;
                    };
                    const resp = await fetchSearch(
                        `${name}`,
                        undefined,
                        fetchWithHeaders
                    );
                    if (resp.object === "error") {
                        contents.push({
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
                    console.log("[gemini] retrieved cards", formatted_cards);
                    contents.push({
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
                    return null;
            }
        }
    }
}
