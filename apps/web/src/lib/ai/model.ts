"use server";
import {
    type ContentListUnion,
    // FunctionCallingConfigMode,
    type FunctionDeclaration,
    Type,
    GoogleGenAI,
} from "@google/genai";
import { SYSTEM_PROMPT } from "./prompt";

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

const get_rulings: FunctionDeclaration = {
    name: "get_rulings",
    description: "gets the rulings for a card given its name.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            name: {
                type: Type.STRING,
                description: "The name of the card to get rulings for.",
            },
        },
        required: ["name"],
    },
};

const get_random_card: FunctionDeclaration = {
    name: "get_random_card",
    description: "gets a random card, optionally matching a scryfall query.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: {
                type: Type.STRING,
                description:
                    "A scryfall query to filter the random card. Can be an empty string for any random card.",
            },
        },
    },
};

export async function queryModel(contents: ContentListUnion) {
    console.log("[gemini-backend] querying", contents);
    try {
        const resp = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: contents,
            config: {
                temperature: 1.3,
                candidateCount: 1,
                systemInstruction: SYSTEM_PROMPT,
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
                            get_rulings,
                            get_random_card,
                        ],
                    },
                ],
            },
        });
        return JSON.stringify(resp);
    } catch {
        return null;
    }
}
