import { ReactCodeMirrorProps } from "@uiw/react-codemirror";
import { useCallback, useRef, useState } from "react";

import { queriesFromView, type Query } from "codemirror-lang-scrycards";
import { SearchSettings } from "@/lib/scryfall";

export function useQueryDoc() {
    const [ast, setAst] = useState<string | undefined>(undefined);

    const [queryNodes, setQueryNodes] = useState<
        { node: Node; offset: number; query: Query; active: boolean }[]
    >([]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const queriesRef = useRef<Query[]>([]);
    const queryNamesRef = useRef<string[]>([]);
    const activeQueryNameRef = useRef<{ n: string; i: number }>({
        n: "",
        i: 0,
    });

    const activateQuery = useCallback((index: number | null) => {
        if (index === null) {
            console.log("activating null");
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

    const onChange = useCallback<NonNullable<ReactCodeMirrorProps["onChange"]>>(
        (value, viewUpdate) => {
            // console.log(
            //     "from completion:",
            //     viewUpdate.transactions[0]?.annotation(
            //         Transaction.userEvent
            //     ) === "input.complete"
            // );
            // setDoc(value);

            const old_query_name = activeQueryNameRef.current.n;

            const queries = queriesFromView(viewUpdate.view);

            if (!Array.isArray(queries)) {
                setAst(value.replace(/\s/g, ""));
                const query = {
                    name: {
                        text: "[unnamed]",
                        to: 0,
                        from: 0,
                    },
                    body: queries.body,
                };
                setActiveIndex(0);
                activeQueryNameRef.current = {
                    n: "[unnamed]",
                    i: 0,
                };
                queriesRef.current = [];
                return;
            }

            queriesRef.current = queries;

            const query_nodes = queries.map((q) => {
                const { node, offset } = viewUpdate.view.domAtPos(q.name.to);
                return { node, offset, query: q, active: false };
            });
            setQueryNodes(query_nodes);

            const new_query_names = queries.map(
                (q) => q.name.text || "[unnamed]"
            );
            const old_query_names = queryNamesRef.current;
            queryNamesRef.current = new_query_names;

            const new_query_names_set = new Set(new_query_names);
            const repeat_index = activeQueryNameRef.current.i;

            if (!new_query_names_set.has(old_query_name)) {
                if (old_query_names.length === new_query_names.length) {
                    const index = old_query_names.indexOf(old_query_name);
                    activateQuery(index === -1 ? null : index);
                    return;
                }

                activateQuery(null);
                setAst(undefined);
                return;
            }

            const candidates = queries
                .map((q, i) => ({ name: q.name.text, body: q.body.text, i }))
                .filter((q) => q.name === old_query_name);
            if (repeat_index >= candidates.length) {
                activateQuery(null);
                setAst(undefined);
                return;
            }
            const candidate = candidates[repeat_index];
            if (!candidate) {
                throw Error(`uh oh ${candidates}`);
            }
            setAst(candidate.body.replace(/\s/g, ""));
            activateQuery(candidate.i);
        },
        []
    );

    const updated_query_nodes = queryNodes.map((q) => ({
        ...q,
        active: false,
    }));
    let activeQuery = null;
    if (activeIndex !== null) {
        if (updated_query_nodes[activeIndex] !== undefined) {
            activeQuery = updated_query_nodes[activeIndex].query;
            updated_query_nodes[activeIndex].active = true;
        }
    }

    return {
        onChange,
        activateQuery,
        queryNodes: updated_query_nodes,
        activeQuery,
        ast,
    };
}
