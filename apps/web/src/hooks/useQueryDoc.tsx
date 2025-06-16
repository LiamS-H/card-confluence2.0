import {
    EditorView,
    ReactCodeMirrorProps,
    // Transaction,
} from "@uiw/react-codemirror";
import { useCallback, useRef, useState } from "react";

import {
    queriesFromView,
    type Query,
    type Domain,
} from "codemirror-lang-scrycards";
import { SearchSettings } from "@/lib/scryfall";

const INITIAL = `
order:cmc
@query latest cards
-(game:mtga or game:mtgo)
-banned:commander
order:released
direction:desc
@query elves
t:elf
`;

export function useQueryDoc() {
    const [scryfallSettings, setScryfallSettings] = useState<SearchSettings>(
        {}
    );
    const [queryNodes, setQueryNodes] = useState<
        {
            node: Node;
            offset: number;
            query: Query;
            active: boolean;
            ast: string;
        }[]
    >([]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [fastUpdate, setFastUpdate] = useState(false);
    const [currentDomain, setDomain] = useState<Domain | null>(null);
    const queriesRef = useRef<Query[]>([]);
    const queryNamesRef = useRef<string[]>([]);
    const activeQueryNameRef = useRef<{ n: string; i: number }>({
        n: "",
        i: 0,
    });

    const activateQuery = useCallback((index: number | null, fast = true) => {
        setFastUpdate(fast);
        if (index === null) {
            setActiveIndex(null);
            return;
        }
        const query = queriesRef.current[index];
        if (!query) {
            throw Error("Invalid Query Index");
        }
        const name = query.name.text;
        let count = 0;
        for (let i = 0; i < index; i++) {
            if (queriesRef.current[i]?.name.text === name) {
                count++;
            }
        }
        setActiveIndex(index);
        activeQueryNameRef.current = { n: name, i: count };
    }, []);

    const [doc, setDoc] = useState(INITIAL);

    const updateDocAt = useCallback(
        (from: number, to: number, text: string) => {
            setDoc((doc) => doc.substring(0, from) + text + doc.substring(to));
        },
        []
    );

    const changeDocDomain = useCallback(
        (new_domain: string) => {
            if (currentDomain) {
                updateDocAt(currentDomain.from, currentDomain.to, new_domain);
            } else {
                // setDoc(
                //     `${new_domain}\n${queriesRef.current.map((q) => `\n@query ${q.name.text}\n${q.body.text}`)}\n`
                // );
                setDoc((doc) => `${new_domain}\n${doc}`);
            }
        },
        [updateDocAt, currentDomain]
    );

    const addDocQuery = useCallback(
        ({ name, body }: { name: string; body: string }) => {
            setDoc((doc) => doc + `\n@query ${name}\n${body}\n`);
        },
        []
    );

    const setDocQuery = useCallback(
        ({ name, body }: { name: string; body: string }) => {
            if (!queriesRef.current || !activeIndex) return;
            const q = queriesRef.current[activeIndex];
            if (!q) return;
            updateDocAt(q.name.from, q.name.to, name);
            updateDocAt(q.body.from, q.body.to, body);
        },
        [updateDocAt, activeIndex]
    );

    const updateQueries = useCallback(
        (view: EditorView) => {
            // todo: only update queries that had lines within them change.
            // console.log(
            //     "from completion:",
            //     viewUpdate.transactions[0]?.annotation(
            //         Transaction.userEvent
            //     ) === "input.complete"
            // );

            const old_query_name = activeQueryNameRef.current.n;

            const { queries, domain } = queriesFromView(view);

            setDomain(domain);

            queriesRef.current = queries;

            const query_nodes = queries.map((q) => {
                const { node, offset } = view.domAtPos(q.name.to);
                // TODO: placeholder for get-ast function
                const ast = ((domain?.text ?? "") + " " + q.body.text).replace(
                    /\s/g,
                    ""
                );
                return { node, offset, query: q, active: false, ast };
            });

            setQueryNodes(query_nodes);

            if (query_nodes.length === 0) {
                return;
            }

            const new_query_names = queries.map(
                (q) => q.name.text || "[unnamed]"
            );
            const old_query_names = queryNamesRef.current;
            queryNamesRef.current = new_query_names;

            const new_query_names_set = new Set(new_query_names);
            const repeat_index = activeQueryNameRef.current.i;

            if (old_query_names.length === new_query_names.length) {
                const index = old_query_names.indexOf(old_query_name);
                activateQuery(index === -1 ? null : index, false);
                return;
            }

            if (old_query_names.length + 1 === new_query_names.length) {
                const old_query_names_set = new Set(old_query_names);
                for (let i = 0; i < new_query_names.length; i++) {
                    const new_query = new_query_names[i];
                    // @ts-expect-error because i from from iterating the length the [i] is safe
                    if (old_query_names_set.has(new_query)) continue;
                    activateQuery(i);
                    return;
                }
            }

            if (!new_query_names_set.has(old_query_name)) {
                activateQuery(null);
                return;
            }

            const candidates = queries
                .map((q, i) => ({ name: q.name.text, body: q.body.text, i }))
                .filter((q) => q.name === old_query_name);
            if (repeat_index >= candidates.length) {
                activateQuery(null);
                return;
            }
            const candidate = candidates[repeat_index];
            if (!candidate) {
                throw Error(`uh oh ${candidates}`);
            }
            activateQuery(candidate.i);
        },
        [activateQuery]
    );

    const onCreateEditor = useCallback<
        NonNullable<ReactCodeMirrorProps["onCreateEditor"]>
    >(
        (view) => {
            // (view,state ) => {
            updateQueries(view);
        },
        [updateQueries]
    );

    const onUpdate = useCallback<NonNullable<ReactCodeMirrorProps["onUpdate"]>>(
        (viewUpdate) => {
            if (!viewUpdate.transactions[0]?.docChanged) return;
            updateQueries(viewUpdate.view);
        },
        [updateQueries]
    );
    const onChange = useCallback<NonNullable<ReactCodeMirrorProps["onChange"]>>(
        (value) => {
            setDoc(value);
        },
        []
    );

    const updated_query_nodes = queryNodes.map((q) => {
        // TODO: use SearchCache context to test if query has been solved already
        const domain = currentDomain?.text ?? "";
        const query = q?.query.body.text ?? "";
        let full_query: string = `${domain} ${query}`;
        const computed_settings: SearchSettings = {};
        // TODO: make generic for all settings, loop over settings to extract application of settings
        const reg = /[^a-zA-Z]?order:([a-zA-Z]*)/;
        const setting_in_domain = (domain.match(reg) ?? []).at(1);
        const setting_in_query = (query.match(reg) ?? []).at(1);
        computed_settings.order =
            setting_in_query ?? setting_in_domain ?? undefined;
        if (setting_in_domain && setting_in_query && !scryfallSettings.order) {
            full_query = `${domain.replace(reg, "")} ${query}`;
        }

        if (scryfallSettings.order && (setting_in_domain || setting_in_query)) {
            full_query = full_query.replace(/[^a-zA-Z]?order:[a-zA-Z]+/g, "");
        }
        return {
            ...q,
            computed_settings,
            full_query,
            active: false,
        };
    });
    let activeQuery = null;

    if (
        activeIndex !== null &&
        updated_query_nodes[activeIndex] !== undefined
    ) {
        updated_query_nodes[activeIndex].active = true;
        activeQuery = updated_query_nodes[activeIndex];
    } else if (updated_query_nodes.length === 0) {
        activeQuery = {
            full_query: currentDomain?.text ?? "",
        };
    }

    return {
        doc,
        onCreateEditor,
        onUpdate,
        onChange,
        activateQuery,
        queryNodes: updated_query_nodes,
        changeDocDomain,
        addDocQuery,
        setDocQuery,
        domain: currentDomain?.text,
        query: activeQuery?.full_query,
        ast: activeQuery?.ast,
        computedSettings: activeQuery?.computed_settings,
        fastUpdate,
        scryfallSettings,
        setScryfallSettings,
    };
}
