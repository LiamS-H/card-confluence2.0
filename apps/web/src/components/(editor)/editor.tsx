import ReactCodeEditor, {
    type ReactCodeMirrorProps,
    type ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { EditorView, keymap } from "@codemirror/view";
import {
    defaultKeymap,
    indentLess,
    indentMore,
    // indentWithTab
} from "@codemirror/commands";
import { acceptCompletion, completionStatus } from "@codemirror/autocomplete";
import React, { type ReactNode, useMemo, useRef } from "react";
import { useLightDark } from "@/components/(theme)/use-theme";
import { type ICatalog, scrycardsFromCatalog } from "codemirror-lang-scrycards";
import { Button } from "@/components/(ui)/button";
import { Copy, Search, TextSearch } from "lucide-react";
import { SimpleToolTip } from "../(ui)/tooltip";
import { cn } from "@/lib/utils";
import { useEditorQueriesContext } from "@/context/editor-queries";
import { useEditorSettingsContext } from "@/context/editor-settings";

function QueryWrapper({
    children,
    node,
    offset,
}: {
    children: ReactNode;
    node: Node;
    offset: number;
}) {
    if (!(node instanceof Text)) return null;

    try {
        const range = document.createRange();
        range.setStart(node, offset);
        range.setEnd(node, node.length);
        const rect = range.getBoundingClientRect();
        range.collapse();
        return (
            <div
                className="absolute z-30 flex gap-1"
                style={{
                    top: rect.top,
                    left: rect.x + rect.width,
                }}
            >
                {children}
            </div>
        );
    } catch {
        return null;
    }
}

function QueryNode({
    query: { node, offset, active, computed_query },
    i,
}: {
    query: {
        node: Node;
        offset: number;
        active: boolean;
        computed_query: string;
    };
    i: number;
}) {
    const { activateQuery } = useEditorQueriesContext();
    return (
        <QueryWrapper node={node} offset={offset}>
            <SimpleToolTip text="Activate query">
                <Button
                    variant={active ? "default" : "outline"}
                    className="w-0.5 h-0.5"
                    onClick={
                        active
                            ? () => {
                                  activateQuery(null);
                              }
                            : () => {
                                  activateQuery(i);
                                  window.scrollTo({
                                      top: 0,
                                      behavior: "instant",
                                  });
                              }
                    }
                >
                    {active ? <TextSearch /> : <Search />}
                </Button>
            </SimpleToolTip>
            <SimpleToolTip text="Copy">
                <Button
                    className="w-0.5 h-0.5"
                    variant="outline"
                    onClick={() => {
                        navigator.clipboard.writeText(computed_query);
                    }}
                >
                    <Copy />
                </Button>
            </SimpleToolTip>
        </QueryWrapper>
    );
}

export function Editor({
    doc,
    catalog,
    onCreateEditor,
    onUpdate,
    onChange,
    className,
    children,
}: {
    doc: string;
    catalog: ICatalog;
    onCreateEditor: ReactCodeMirrorProps["onCreateEditor"];
    onUpdate: ReactCodeMirrorProps["onUpdate"];
    onChange: ReactCodeMirrorProps["onChange"];
    className?: string;
    children?: ReactNode;
}) {
    const { settings } = useEditorSettingsContext();
    const { queryNodes } = useEditorQueriesContext();
    const theme = useLightDark();
    const editorRef = useRef<ReactCodeMirrorRef | null>(null);

    const extensions = useMemo(() => {
        const extensions = [
            keymap.of([
                {
                    key: "Tab",
                    preventDefault: true,
                    shift: indentLess,
                    run: (e) => {
                        if (!completionStatus(e.state)) return indentMore(e);
                        return acceptCompletion(e);
                    },
                },
            ]),
            scrycardsFromCatalog(catalog),
            EditorView.lineWrapping,
        ];

        return extensions;
    }, [catalog, settings]);

    const queryComponents = useMemo(
        () =>
            queryNodes.map(({ node, offset, active, computed_query }, i) => (
                <QueryNode
                    key={i}
                    query={{ node, offset, active, computed_query }}
                    i={i}
                />
            )),
        [queryNodes]
    );

    return (
        <ReactCodeEditor
            className={cn("font-[monospace]", className)}
            ref={editorRef}
            extensions={extensions}
            value={doc}
            theme={theme === "dark" ? "dark" : "light"}
            onCreateEditor={onCreateEditor}
            onUpdate={onUpdate}
            onChange={onChange}
            indentWithTab={false}
            basicSetup={{
                autocompletion: !settings.disableAutocomplete,
            }}
        >
            {queryComponents}
            {children}
        </ReactCodeEditor>
    );
}
