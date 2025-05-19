import { parser } from "./syntax.grammar";
import {
    LRLanguage,
    LanguageSupport,
    indentNodeProp,
    foldNodeProp,
    foldInside,
    delimitedIndent,
} from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";

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
                Prefix: t.logicOperator,
                And: t.keyword,
                Or: t.keyword,
                Argument: t.variableName,
                // Name: t.variableName,
                Number: t.number,
                String: t.string,
                Operator: t.operator,
                StringLiteral: t.string,
                RegExp: t.regexp,
                // Boolean: t.bool,
            }),
        ],
    }),
    languageData: {
        commentTokens: { line: ";" },
    },
});

export function scrycards() {
    return new LanguageSupport(scrycardsLanguage, []);
}
