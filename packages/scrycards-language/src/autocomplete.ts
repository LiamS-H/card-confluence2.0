import type {
    Completion,
    CompletionResult,
    CompletionSection,
    CompletionSource,
} from "@codemirror/autocomplete";

import { tagFromView } from "./utils/tag-from-view";
import { syntaxTree } from "@codemirror/language";
import { scrycardsCatalogFacet } from "./catalog";
import { EditorSelection } from "@codemirror/state";

import {
    argTypeFromArg,
    argTypeFromString,
    ARGUMENTS,
    detailFromArg,
    isArgument,
    nodeFromArg,
} from "./utils/completion";
import { completionFromTypes, TYPE_TAG_TYPE } from "./utils/type-completion";

const BEGIN_OPERATORS = [":", "<", ">", "=", "!"] as const;

const OPERATORS = [":", "=", "<", ">", "<=", ">=", "!="] as const;
const ASSERT_OPERATORS = [":", "="] as const;

// function argRec(argument: string, commit: boolean, from: number, to?: number) {}

export const completeScrycards: CompletionSource = (context) => {
    if (!context.view) return null;

    const view = context.view;

    const pos = context.pos;

    const tag = tagFromView(view, pos);

    const catalog = context.state.facet(scrycardsCatalogFacet);

    if (!tag) {
        const cursor = syntaxTree(view.state).cursorAt(pos, -1);

        if (cursor.name === "StringLiteral") {
            return {
                from: cursor.from + 1,
                to: cursor.to - 1,
                options: catalog["card-names"].map((name) => ({
                    label: name,
                })),
            };
        }

        if (cursor.name !== "Argument") {
            return null;
        }

        const argument = view.state.sliceDoc(cursor.node.from, cursor.node.to);
        const lower_arg = argument.toLowerCase();

        // arguments don't match so the argument is a name
        if (ARGUMENTS.every((a) => !a.includes(lower_arg))) {
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
            };
        }

        const result: CompletionResult = {
            from: cursor.node.from,
            to: cursor.node.to,
            options: ARGUMENTS.map((tag): Completion => {
                const boost = tag.startsWith(lower_arg) ? 1 : -1;
                const { detail, info } = detailFromArg(tag);
                return {
                    label: tag,
                    boost,
                    detail,
                    info,
                };
            }),
            commitCharacters: BEGIN_OPERATORS,
        };
        // const results = result.options.length;
        if (isArgument(lower_arg)) {
            const node = nodeFromArg(lower_arg);
            const operators =
                node.operator === "assign"
                    ? [":"]
                    : node.operator === "assert"
                      ? ASSERT_OPERATORS
                      : OPERATORS;
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

    const lower_arg = argument.toLowerCase();

    if (pos <= op_start) {
        const result: CompletionResult = {
            from: arg_start,
            to: op_start,
            options: ARGUMENTS.map((tag) => {
                const boost = tag.startsWith(lower_arg) ? 1 : -1;
                const { detail, info } = detailFromArg(tag);
                return {
                    label: tag,
                    boost,
                    detail,
                    info,
                };
            }),
        };
        if (isArgument(lower_arg)) {
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
            const node = nodeFromArg(lower_arg);
            const operators =
                node.operator === "assign"
                    ? [":"]
                    : node.operator === "assert"
                      ? ASSERT_OPERATORS
                      : OPERATORS;
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
    let to: number;
    let from: number;
    let commitCharacters: string[] = [];
    let apply: Completion["apply"];
    if (value.length > 1 && value.at(0) === '"' && value.at(-1) === '"') {
        val = value.substring(1, value.length - 1);
        from = val_start + 1;
        to = tag_end - 1;
    } else {
        val = value;
        from = val_start;
        to = tag_end;
        commitCharacters = [" "];
        apply = (view, completion) => {
            if (completion.label.includes(" ")) {
                completion.label = `"${completion.label}"`;
            }
            view.dispatch(
                view.state.update({
                    changes: {
                        from,
                        to,
                        insert: completion.label,
                    },
                    selection: EditorSelection.cursor(
                        from + completion.label.length
                    ),
                    userEvent: "completion.apply",
                })
            );
        };
    }

    if (!isArgument(lower_arg)) {
        return null;
    }

    const arg_type = argTypeFromArg(lower_arg);

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
            result.options = catalog["flavor-words"].map((fw) => ({
                label: fw,
            }));
            return result;
        case "oracle":
            // result.options = catalog["ability-words"].map((fw) => ({
            //     label: fw,
            // }));
            // return result;
            return null;
        case "type":
            result.options = completionFromTypes(catalog);
            return result;

        // if (!constraints) {
        //     result.options = completionFromTypes(catalog);
        //     return result;
        // }

        // constraints.required = constraints.required.filter(
        //     (c) => argTypeFromString(c.argument) === "type"
        // );

        // const card_types = catalog["card-types"].map((t) =>
        //     t.toLowerCase()
        // );
        // const required_types = constraints.required
        //     .map((c) => c.value.toLowerCase())
        //     .filter((v) => card_types.includes(v));
        // if (required_types.length > 0) {
        //     const catalog_type_names = required_types
        //         .map((t) => {
        //             switch (t) {
        //                 case "creature":
        //                 case "artifact":
        //                 case "enchantment":
        //                 case "land":
        //                 case "planeswalker":
        //                 case "battle":
        //                     return (t + "-types") as TYPE_TAG_TYPE;
        //                 default:
        //                     return null;
        //             }
        //         })
        //         .filter((n) => !!n);
        //     catalog_type_names.unshift("card-types");
        //     catalog_type_names.push("supertypes");
        //     console.log(catalog_type_names);
        //     result.options = completionFromTypes(
        //         catalog,
        //         catalog_type_names
        //     );
        //     return result;
        // }

        // result.options = completionFromTypes(catalog);
        // return result;
        case "set":
            result.options = catalog.sets.map((set) => ({
                label: set.code,
                detail: set.name,
                info: set.released,
            }));
            result.options = catalog.sets.map((set) => ({
                label: set.name,
                detail: set.code,
                info: set.released,
            }));
            return result;
        case "is":
            result.options = catalog.criteria.map((crit) => ({
                label: crit.toLowerCase().replace(" ", "-"),
                displayLabel: crit,
            }));
            return result;
        case "power":
            result.options = catalog.powers.map((po) => ({ label: po }));
            return result;
        case "toughness":
            result.options = catalog.powers.map((to) => ({ label: to }));
            return result;
        case "powtou":
            return null;
        case "loyalty":
            result.options = catalog.loyalties.map((loy) => ({ label: loy }));
            return result;
        case "mana":
            return null;
        case "name":
            result.commitCharacters = undefined;
            result.options = catalog["card-names"].map((n) => ({
                label: n,
                apply,
            }));
            return result;
        case "color":
            return null;
        case "keyword":
            result.options = catalog["keyword-abilities"].map((n) => ({
                label: n,
                apply,
            }));
            return result;
        case "cmc":
            return null;
        case "rarity":
            result.options = catalog.rarities.map((r) => ({ label: r }));
            return result;
        case "cube":
            result.options = catalog.cubes.map((c) => ({ label: c }));
            return result;
        case "format":
            result.options = catalog.formats.map((f) => ({ label: f, apply }));
            return result;
        case "artist":
            result.options = catalog["artist-names"].map((a) => ({
                label: a,
                apply,
            }));
            return result;
        case "watermark":
            result.options = catalog["artist-names"].map((a) => ({ label: a }));
            return result;
        case "border":
            return null;
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
        case "product":
            result.options = catalog["products"].map((p) => ({
                label: p,
            }));
            return result;
        case "unique":
            result.options = ["cards", "art", "prints"].map((u) => ({
                label: u,
            }));
            return result;
        case "order":
            result.options = catalog["orders"].map((o) => ({
                label: o,
            }));
            return result;
        case "dir":
            result.options = ["asc", "ascending", "desc", "descending"].map(
                (d) => ({
                    label: d,
                })
            );
            return result;
        case "uuid":
            return null;

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
