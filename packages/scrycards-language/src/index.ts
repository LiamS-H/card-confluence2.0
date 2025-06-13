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
import { completeScrycards } from "./autocomplete";
import {
    scrycardsCatalogFacet,
    type ICatalog,
    type IDetailedCatalogEntry,
    getEmptyCatalog,
} from "./catalog";
import {
    queriesFromView,
    type Query,
    type Domain,
} from "./utils/queries-from-view";
import { tagFromView } from "./utils/tag-from-view";
export {
    argTypeFromString,
    argTypeFromArg,
    completionInfoFromArg,
    detailFromArg,
    isArgument,
} from "./utils/completion";

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
                Query: tags.keyword,
                QueryName: tags.labelName,
                Argument: tags.variableName,
                Number: tags.number,
                String: tags.string,
                Operator: tags.operator,
                StringLiteral: tags.string,
                RegExp: tags.regexp,
            }),
        ],
    }),
});

export function scrycards() {
    return new LanguageSupport(scrycardsLanguage, [
        ScrycardsTooltips,
        scrycardsLanguage.data.of({ autocomplete: completeScrycards }),
    ]);
}

export function scrycardsFromCatalog(value: ICatalog) {
    return new LanguageSupport(scrycardsLanguage, [
        ScrycardsTooltips,
        scrycardsLanguage.data.of({ autocomplete: completeScrycards }),
        scrycardsCatalogFacet.of(value),
    ]);
}

export { completeScrycards, ScrycardsTooltips };

export type { ICatalog, IDetailedCatalogEntry };
export { scrycardsCatalogFacet, getEmptyCatalog };
export { tagFromView };
export { queriesFromView };
export type { Query, Domain };
