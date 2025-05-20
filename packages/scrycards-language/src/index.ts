import { parser } from "./syntax.grammar";
import {
    LRLanguage,
    LanguageSupport,
    indentNodeProp,
    foldNodeProp,
    foldInside,
    delimitedIndent,
} from "@codemirror/language";
import { styleTags, tags } from "@lezer/highlight";
import { ScrycardsTooltips } from "./tooltip";
import { ScrycardsAutocomplete } from "./autocomplete";

export const scrycardsLanguage = LRLanguage.define({
    parser: parser.configure({
        props: [
            indentNodeProp.add({
                Application: delimitedIndent({ closing: ")", align: false }),
            }),
            foldNodeProp.add({
                Application: foldInside,
            }),
            styleTags({
                Prefix: tags.logicOperator,
                And: tags.keyword,
                Or: tags.keyword,
                Argument: tags.variableName,
                // Name: t.variableName,
                Number: tags.number,
                String: tags.string,
                Operator: tags.operator,
                StringLiteral: tags.string,
                RegExp: tags.regexp,
                // Boolean: t.bool,
            }),
        ],
    }),
    languageData: {
        commentTokens: { line: ";" },
    },
});

export function scrycards() {
    return new LanguageSupport(scrycardsLanguage, [
        ScrycardsAutocomplete,
        ScrycardsTooltips,
    ]);
}
