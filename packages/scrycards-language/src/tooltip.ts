import { hoverTooltip } from "@codemirror/view";

import { syntaxTree } from "@codemirror/language";
import { tagFromTree } from "./utils/tag-from-tree";

export const ScrycardsTooltips = hoverTooltip((view, pos, side) => {
    const tag = tagFromTree(view, pos + 1);

    if (!tag) {
        const cursor = syntaxTree(view.state).cursorAt(pos + 1, -1);
        return {
            end: pos,
            pos,
            above: true,
            create(view) {
                let dom = document.createElement("div");
                dom.textContent = cursor.name;
                return { dom };
            },
        };
    }

    return {
        pos: tag.arg_start,
        above: true,
        create(view) {
            let dom = document.createElement("div");
            dom.textContent = `${tag.argument}${tag.operator}${tag.value}`;
            return { dom };
        },
    };
});
