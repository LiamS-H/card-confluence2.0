import type { Completion } from "@codemirror/autocomplete";
import type { ICatalog } from "../catalog";

const TYPE_TAG_TYPES = [
    "card-types",
    "creature-types",
    "artifact-types",
    "enchantment-types",
    "land-types",
    "planeswalker-types",
    "battle-types",
    "spell-types",
    "supertypes",
] as const;

export type TYPE_TAG_TYPE = (typeof TYPE_TAG_TYPES)[number];

export function isCardType(string: string): string is TYPE_TAG_TYPE {
    return (TYPE_TAG_TYPES as readonly string[]).includes(string);
}

export function completionFromTypes(
    catalog: ICatalog,
    types: readonly TYPE_TAG_TYPE[] = TYPE_TAG_TYPES
) {
    let result: Completion[] = [];
    for (let i = 0; i < types.length; i++) {
        const type = types[i];
        // const rank = types.indexOf(type);
        result = result.concat(
            catalog[type].map((t) => ({
                label: t.toLowerCase(),
                displayLabel: t,
                section: { name: type, rank: i },
            }))
        );
    }
    return result;
}
