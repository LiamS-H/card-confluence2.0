import { CompletionSource } from "@codemirror/autocomplete";
import { autocompletion } from "@codemirror/autocomplete";

import { syntaxTree } from "@codemirror/language";

export const completeScrycards: CompletionSource = (context) => {
    const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
    context.state.sliceDoc(nodeBefore.from, context.pos);
    return null;
};

export const ScrycardsAutocomplete = autocompletion({
    override: [completeScrycards],
});
