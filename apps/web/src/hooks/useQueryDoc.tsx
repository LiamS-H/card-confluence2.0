import {
    EditorView,
    ReactCodeMirrorProps,
    // Transaction,
} from "@uiw/react-codemirror";
import { useCallback, useMemo, useRef, useState } from "react";

import {
    queriesFromView,
    type Query,
    type Domain,
} from "codemirror-lang-scrycards";
import { ISearchSettings } from "@/lib/scryfall";
import { isSettingsEqual, settingsToText } from "@/lib/scrycards";
import { mergeObjects } from "@/lib/utils";
import { useCompareMemo } from "./useCompareMemo";
import { IEditorQueriesContext } from "@/context/editor-queries";

const INITIAL = `
order:cmc
game:paper
(legal:commander or year>=${new Date().toISOString().slice(0, 10)})

@query latest cards
order:released
direction:desc
is:firstprinting

@query elves
t:elf
`;

export function useQueryDoc() {
    const [scryfallSettings, setScryfallSettings] = useState<ISearchSettings>(
        {}
    );
    const [_queryNodes, _setQueryNodes] = useState<
        IEditorQueriesContext["queryNodes"]
    >([]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [fastUpdate, setFastUpdate] = useState(false);
    const [_domain, _setDomain] = useState<Domain | null>(null);
    const queriesRef = useRef<Query[]>([]);
    const queryNamesRef = useRef<string[]>([]);
    const activeQueryNameRef = useRef<{ n: string; i: number } | null>(null);

    const activateQuery = useCallback((index: number | null) => {
        setFastUpdate(true);
        if (index === null) {
            setActiveIndex(null);
            activeQueryNameRef.current = null;
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
            if (_domain) {
                updateDocAt(_domain.from, _domain.to, new_domain);
            } else {
                // setDoc(
                //     `${new_domain}\n${queriesRef.current.map((q) => `\n@query ${q.name.text}\n${q.body.text}`)}\n`
                // );
                setDoc((doc) => `${new_domain}\n${doc}`);
            }
        },
        [updateDocAt, _domain]
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

            const { queries, domain } = queriesFromView(view);
            _setDomain(domain);

            queriesRef.current = queries;

            const query_nodes = queries.map((q) => {
                const { node, offset } = view.domAtPos(q.name.to);
                // TODO: placeholder for get-ast function
                const ast = ((domain?.text ?? "") + " " + q.body.text).replace(
                    /\s/g,
                    ""
                );
                const computed_settings = mergeObjects(
                    q.body.settings,
                    domain?.settings
                );
                return {
                    node,
                    offset,
                    query: q,
                    computed_query:
                        settingsToText(computed_settings) +
                        q.body.mergedTextNoSetting,
                    noSettings: q.body.mergedTextNoSetting,
                    active: false,
                    ast,
                    computed_settings,
                };
            });

            _setQueryNodes(query_nodes);

            if (query_nodes.length === 0) {
                return;
            }

            const new_query_names = queries.map(
                (q) => q.name.text || "[unnamed]"
            );
            const old_query_names = queryNamesRef.current;
            queryNamesRef.current = new_query_names;

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

            if (activeQueryNameRef.current === null) return;

            const new_query_names_set = new Set(new_query_names);

            const old_query_name = activeQueryNameRef.current.n;
            const repeat_index = activeQueryNameRef.current.i;

            if (old_query_names.length === new_query_names.length) {
                const index = old_query_names.indexOf(old_query_name);
                activateQuery(index === -1 ? null : index);
                return;
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
            if (
                !viewUpdate.transactions[0]?.docChanged &&
                !viewUpdate.heightChanged
            )
                return;
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

    const { queryNodes, activeQuery } = useMemo(() => {
        const updated_query_nodes = _queryNodes.map((q) => ({ ...q }));
        if (
            activeIndex !== null &&
            updated_query_nodes[activeIndex] !== undefined
        ) {
            updated_query_nodes[activeIndex].active = true;
            const activeQuery = updated_query_nodes[activeIndex];
            return { queryNodes: updated_query_nodes, activeQuery };
        }
        const computed_settings = _domain?.settings ?? {};
        if (updated_query_nodes.length === 0) {
            const activeQuery = {
                ast: undefined,
                noSettings: _domain?.noSettingText,
                computed_settings,
            };
            return { queryNodes: updated_query_nodes, activeQuery };
        }
        const activeQuery = {
            ast: undefined,
            noSettings: undefined,
            computed_settings,
        };
        return { queryNodes: updated_query_nodes, activeQuery };
    }, [activeIndex, _queryNodes, _domain]);

    const computedSettings = useCompareMemo(
        activeQuery.computed_settings,
        isSettingsEqual
    );
    // const computedSettings = activeQuery.computed_settings;
    const mergedSettings = useMemo(() => {
        return mergeObjects(scryfallSettings, computedSettings);
    }, [scryfallSettings, computedSettings]);

    const context: IEditorQueriesContext = {
        activateQuery,
        fastUpdate,
        queryNodes,
        changeDocDomain,
        addDocQuery,
        setDocQuery,
        computedQuery: activeQuery?.noSettings,
        ast: activeQuery?.ast,
        computedSettings: computedSettings,
        scryfallSettings,
        mergedSettings,
        setScryfallSettings,
    };

    return {
        doc,
        onCreateEditor,
        onUpdate,
        onChange,
        context,
    };
}
