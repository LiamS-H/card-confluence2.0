import type {
    Completion,
    CompletionResult,
    CompletionSection,
    CompletionSource,
} from "@codemirror/autocomplete";

import { tagFromTree } from "./utils/tag-from-tree";
import { syntaxTree } from "@codemirror/language";
import { scrycardsCatalogFacet } from "./catalog";
import { EditorSelection } from "@codemirror/state";

import {
    argTypeFromArg,
    ARGUMENTS,
    isArgument,
    nodeFromArg,
} from "./utils/completion";

const BEGIN_OPERATORS = [":", "<", ">", "=", "!"] as const;

const OPERATORS = [":", "=", "<", ">", "<=", ">=", "!="] as const;
const ASSERT_OPERATORS = [":", "="] as const;

// function argRec(argument: string, commit: boolean, from: number, to?: number) {}

export const completeScrycards: CompletionSource = (context) => {
    if (!context.view) return null;

    const view = context.view;

    const pos = context.pos;

    const tag = tagFromTree(view, pos);

    const catalog = context.state.facet(scrycardsCatalogFacet);

    if (!tag) {
        const cursor = syntaxTree(view.state).cursorAt(pos, -1);

        if (cursor.name !== "Argument") {
            return null;
        }

        const argument = view.state.sliceDoc(cursor.node.from, cursor.node.to);

        // arguments don't match so the argument is a name
        if (ARGUMENTS.every((a) => !a.includes(argument))) {
            while (cursor.prevSibling() && cursor.name === "Argument") {}
            if (cursor.name !== "Argument") cursor.nextSibling();
            const from = cursor.node.from;
            while (cursor.nextSibling() && cursor.name === "Argument") {}
            if (cursor.name !== "Argument") cursor.prevSibling();
            const to = cursor.node.to;
            // const card_name = view.state.sliceDoc(from, to);

            return {
                from,
                to,
                options: catalog["card-names"].map((name) => ({
                    label: name,
                })),
                // commitCharacters: [" "],
            };
        }
        const result: CompletionResult = {
            from: cursor.node.from,
            to: cursor.node.to,
            options: ARGUMENTS.map((tag): Completion => {
                const boost = tag.startsWith(argument) ? 1 : -1;
                return {
                    label: tag,
                    boost,
                };
            }),
            commitCharacters: BEGIN_OPERATORS,
        };
        // const results = result.options.length;
        if (isArgument(argument)) {
            const node = nodeFromArg(argument);
            const operators =
                node.operator === "assert" ? ASSERT_OPERATORS : OPERATORS;
            result.options = result.options.concat(
                operators.map(
                    (tag: string): Completion => ({
                        label: argument + tag,
                        displayLabel: tag,
                        // boost: results === 1 ? 2 : 0,
                    })
                )
            );
        }
        return result;
    }

    const {
        arg_start,
        argument,
        op_start,
        operator,
        val_start,
        value,
        tag_end,
    } = tag;

    if (pos <= op_start) {
        const result: CompletionResult = {
            from: arg_start,
            to: op_start,
            options: ARGUMENTS.map((tag) => {
                const boost = tag.startsWith(argument) ? 1 : -1;
                return {
                    label: tag,
                    boost,
                };
            }),
        };
        if (isArgument(argument)) {
            const apply: Completion["apply"] = (view, completion) => {
                view.dispatch(
                    view.state.update({
                        changes: {
                            from: op_start,
                            to: val_start,
                            insert: completion.displayLabel,
                        },
                        selection: EditorSelection.cursor(
                            op_start + (completion.displayLabel?.length ?? 0)
                        ),
                        userEvent: "completion.apply",
                    })
                );
            };
            const node = nodeFromArg(argument);
            const operators =
                node.operator === "assert" ? ASSERT_OPERATORS : OPERATORS;
            result.options = result.options.concat(
                operators.map(
                    (tag: string): Completion => ({
                        label: argument + tag,
                        displayLabel: tag,
                        apply,
                    })
                )
            );
        }
        return result;
    }
    if (pos < val_start) {
        return {
            from: op_start,
            to: val_start,
            options: OPERATORS.map((tag) => ({
                label: tag,
            })),
            filter: false,
        };
    }

    if (value.at(1) === "/" && value.at(-1) === "/") {
        return null;
    }
    let val;
    let to;
    let from;
    let commitCharacters: string[] = [];
    if (value.length > 1 && value.at(0) === '"' && value.at(-1) === '"') {
        val = value.substring(1, value.length - 1);
        from = val_start + 1;
        to = tag_end - 1;
    } else {
        val = value;
        from = val_start;
        to = tag_end;
        commitCharacters = [" "];
    }

    if (!isArgument(argument)) {
        return null;
    }

    // const node = nodeFromArg(argument);

    const arg_type = argTypeFromArg(argument);

    const result: CompletionResult = {
        from,
        to,
        options: [],
        commitCharacters,
    };

    switch (arg_type) {
        case "number":
            return null;
        case "flavor":
            return null;
        case "oracle":
            return null;
        case "type":
            return null;
        case "set":
            result.options = catalog.sets.map((set) => ({ label: set }));
            return result;
        case "is":
            result.options = catalog.criteria.map((crit) => ({ label: crit }));
            return result;
        case "power":
            result.options = catalog.powers.map((po) => ({ label: po }));
            return result;
        case "toughness":
            result.options = catalog.powers.map((to) => ({ label: to }));
            return result;
        case "powtou":
            if (val.includes("/")) {
                const p = val.replace(/[/].*$/, "");
                result.options = catalog.toughnesses.map((po) => ({
                    label: p + po, // everything up to "/"
                    displayLabel: po,
                }));
                return result;
            }
            if (catalog.powers.includes(val)) {
                result.options = [{ label: val + "/", displayLabel: "/" }];
                return result;
            }
            result.options = catalog.powers.map((po) => ({
                label: po,
            }));
            return result;
        case "loyalty":
            result.options = catalog.loyalties.map((loy) => ({ label: loy }));
            return result;
        case "mana":
        case "name":
            result.options = catalog["card-names"].map((n) => ({
                label: n,
            }));
            return result;
        case "color":

        case "keyword":
            result.options = catalog["keyword-abilities"].map((n) => ({
                label: n,
            }));
            return result;
        case "cmc":
        case "rarity":
            result.options = catalog.rarities.map((r) => ({ label: r }));
            return result;
        case "cube":
            result.options = catalog.cubes.map((c) => ({ label: c }));
            return result;
        case "format":
            result.options = catalog.formats.map((f) => ({ label: f }));
            return result;
        case "artist":
            result.options = catalog["artist-names"].map((a) => ({ label: a }));
            return result;
        case "watermark":
            result.options = catalog["artist-names"].map((a) => ({ label: a }));
            return result;
        case "border":
        case "frame":
            return null;
        case "stamp":
            result.options = catalog.stamps.map((a) => ({ label: a }));
            return result;
        case "date":
            return null;
        case "atag":
            result.options = catalog.atags.map((at) => ({ label: at }));
            return result;
        case "otag":
            result.options = catalog.otags.map((ot) => ({ label: ot }));
            return result;
        case "game":
            result.options = catalog.games.map((g) => ({ label: g }));
            return result;
        default:
            return null;
    }

    // return {
    //     form: val_start,
    //     to: tag_end,
    //     options: [],
    // };

    return null;
};
