"use server";
import {
    ContentListUnion,
    // FunctionCallingConfigMode,
    FunctionDeclaration,
    GoogleGenAI,
    Type,
} from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const setDoc: FunctionDeclaration = {
    name: "set_doc",
    description: "sets the user's current query document.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            text: {
                type: Type.STRING,
            },
        },
        required: ["text"],
    },
};
const getDoc: FunctionDeclaration = {
    name: "get_doc",
    description: "gets the user's current query document.",
};
const getTagInfo: FunctionDeclaration = {
    name: "get_tag_info",
    description: "get info on an tag",
    parameters: {
        type: Type.OBJECT,
        properties: {
            tag: {
                type: Type.STRING,
            },
            text: {
                type: Type.STRING,
            },
        },
        required: ["tag"],
    },
};

export async function queryAI(prompt: string, doc: string) {
    const contents: ContentListUnion = [
        {
            role: "user",
            parts: [{ text: prompt }],
        },
    ];
    do {
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
Values can be provided as string literals like t:"creature"

Assertive tag types: (suitable with ":" or "=" operator)
    - game: "paper" | "mtgo" | "mtga"
    - legal: MTG format name: "commander" | "modern" etc
    - type: MTG card type or creature/supertype "t:elf" | "t:srocery" etc
    - oracle: MTG card rules text, ~ can be used to represent generically the name of the card, also searchable with RegExp like o://
    - set: MTG card set or set code
    - kw: Keywords "flying" | "reach" etc
Numerical (suitable with numerical operator ">" "<=" etc)
    - id: Color identity "rgu" | "temur" etc
    - mana: mana used to cast the spell "2b" | "{g}{g/r}"
    - cmc: converted mana costs

Output:
Avoid explanations.
Use function calls to set_doc to write the query instead of wriing directly.`,
                // tags to be added with the search function
                // - is:
                // - otag:
                // toolConfig: {
                //     functionCallingConfig: {
                //         mode: FunctionCallingConfigMode.AUTO,
                //     },
                // },
                maxOutputTokens: 1000,
                // modelSelectionConfig: {
                //     featureSelectionPreference:
                //         FeatureSelectionPreference.PRIORITIZE_COST,
                // },
                tools: [
                    {
                        functionDeclarations: [setDoc, getDoc],
                    },
                ],
            },
        });
        console.log(response);

        if (!response.functionCalls || !response.candidates) {
            return null;
        }
        const candidate = response.candidates[0];
        if (!candidate?.content) {
            return null;
        }
        contents.push(candidate.content);

        for (const func of response.functionCalls) {
            switch (func.name) {
                case "set_doc":
                    return {
                        text: response.text,
                        func,
                    };
                case "get_doc":
                    contents.push({
                        role: "user",
                        parts: [
                            {
                                functionResponse: {
                                    name: "get_document",
                                    response: { text: doc },
                                },
                            },
                        ],
                    });
                case "get_card":
                // scryfall query for getting card
                case "get_tag":
                // a grepish tool (or a second agent) responsible for getting information about the syntax
                // the model submits "set" "tarkir" and recieves the sets matching the description
                default:
                    console.error("undefined func:", func);
                    return null;
            }
        }
    } while (true);
}
