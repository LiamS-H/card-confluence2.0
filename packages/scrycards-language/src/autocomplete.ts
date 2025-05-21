import { Completion, CompletionSource } from "@codemirror/autocomplete";

import { tagFromTree } from "./utils/tag-from-tree";
import { syntaxTree } from "@codemirror/language";

export const completeScrycards: CompletionSource = (context) => {
    if (!context.view) return null;

    const view = context.view;

    const pos = context.pos;

    const tag = tagFromTree(view, pos);

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
                // commitCharacters: [tag.operator],
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

    // const argument = view.state.sliceDoc(argument_node.from, argument_node.to);
    // if (argument_node.from < pos && pos < argument_node.to) {
    //     return {
    //         from: argument_node.from,
    //         options: [argument + "test"].map((tag) => ({ label: tag })),
    //     };
    // }

    // cursor.nextSibling();
    // const operator_node = cursor.node;
    // if (operator_node.from < pos && pos < operator_node.to) {
    //     return {
    //         from: argument_node.from,
    //         options: [":", "=", "<", ">", "<=", ">=", "!="].map((tag) => ({
    //             label: tag,
    //         })),
    //     };
    // }

    // cursor.nextSibling();
    // const value_node = cursor.node;
    // if (value_node.from < pos && pos < value_node.to) {
    //     const value = view.state.sliceDoc(value_node.from, value_node.to);
    //     return {
    //         from: argument_node.from,
    //         options: [value + "test2"].map((tag) => ({ label: tag })),
    //     };
    // }
};

// export const ScrycardsAutocomplete = autocompletion({
//     override: [completeScrycards],
// });

// export const ScrycardsAutocomplete = scrycardsLanguage.data.of({
//     autocomplete: completeScrycards,
// });
