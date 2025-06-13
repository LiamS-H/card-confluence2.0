import { ReactCodeMirrorProps } from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";

import {
    queriesFromView,
    type Query,
    type Domain,
} from "codemirror-lang-scrycards";

export function useQueryDoc() {
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
    const [domain, setDomain] = useState<Domain | null>(null);
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

    const onChange = useCallback<NonNullable<ReactCodeMirrorProps["onChange"]>>(
        (_, viewUpdate) => {
            // todo: only update queries that had lines within them change.
            // console.log(
            //     "from completion:",
            //     viewUpdate.transactions[0]?.annotation(
            //         Transaction.userEvent
            //     ) === "input.complete"
            // );
            // setDoc(value);

            const old_query_name = activeQueryNameRef.current.n;

            const { queries, domain } = queriesFromView(viewUpdate.view);

            setDomain(domain);

            queriesRef.current = queries;

            const query_nodes = queries.map((q) => {
                const { node, offset } = viewUpdate.view.domAtPos(q.name.to);
                // TODO: placeholder for get-ast function
                const ast = (domain?.text ?? "" + " " + q.body.text).replace(
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
        []
    );

    const updated_query_nodes = queryNodes.map((q) => ({
        ...q,
        active: false,
    }));

    let activeQuery = null;
    if (
        activeIndex !== null &&
        updated_query_nodes[activeIndex] !== undefined
    ) {
        updated_query_nodes[activeIndex].active = true;
        const query = updated_query_nodes[activeIndex];
        activeQuery = {
            text: query.query.body.text,
            ast: query.ast,
        };
    }

    useEffect(() => {}, []);

    return {
        onChange,
        activateQuery,
        queryNodes: updated_query_nodes,
        domain,
        activeQuery,
        fastUpdate,
    };
}
