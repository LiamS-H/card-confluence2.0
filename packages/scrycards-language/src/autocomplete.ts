import { Completion, CompletionSource } from "@codemirror/autocomplete";

import { tagFromTree } from "./utils/tag-from-tree";
import { syntaxTree } from "@codemirror/language";
import { scrycardsCatalogFacet } from "./catalog";

export const completeScrycards: CompletionSource = (context) => {
    if (!context.view) return null;

    const view = context.view;

    const pos = context.pos;

    const tag = tagFromTree(view, pos);

    const catalog = context.state.facet(scrycardsCatalogFacet);

    console.log(catalog);

    if (tag) {
        let options: Completion[] = [];
        const commits: string[] = [];

        if (pos === tag.op_start + 1 && pos === tag.val_start) {
            options = options.concat(
                [":", "=", "<", ">", "<=", ">=", "!="]
                    .filter(
                        (s) => s.startsWith(tag.operator) && s !== tag.operator
                    )
                    .map((tag) => ({
                        label: tag,
                    }))
            );
            commits.push(tag.operator);
        }

        if (pos >= tag.val_start) {
            options = options.concat(
                [tag.value + "value"].map((tag) => ({ label: tag }))
            );
            commits.push(tag.value);
            return {
                from: tag.val_start,
                options,
                commitCharacters: commits,
                // commitCharacters: [tag.value],
            };
        }

        if (pos >= tag.op_start) {
            options = options.concat(
                [":", "=", "<", ">", "<=", ">=", "!="].map((tag) => ({
                    label: tag,
                }))
            );
            return {
                from: tag.op_start,
                options,
                commitCharacters: [tag.operator],
            };
        }

        options = options.concat(
            [tag.argument + "arg"].map((tag) => ({
                label: tag,
            }))
        );
        return {
            from: tag.arg_start,
            options,
            // commitCharacters: [tag.argument],
        };
    }

    const cursor = syntaxTree(view.state).cursorAt(pos, -1);

    if (cursor.name === "Argument") {
        const argument = view.state.sliceDoc(cursor.node.from, cursor.node.to);
        return {
            from: cursor.node.from,
            options: [argument + "arg / name"].map((tag) => ({ label: tag })),
        };
    }

    return null;
};
