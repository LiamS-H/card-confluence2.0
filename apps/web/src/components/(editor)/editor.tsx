import ReactCodeEditor, {
    type ReactCodeMirrorProps,
    type ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { indentLess, indentMore } from "@codemirror/commands";
import { acceptCompletion, completionStatus } from "@codemirror/autocomplete";
import { type ReactNode, type RefObject, useMemo, useRef } from "react";
import { useLightDark } from "@/components/(theme)/use-theme";
import {
    completeScrycards,
    type ICatalog,
    scrycardsCatalogFacet,
    scrycardsLanguage,
    scrycardsSettingsFacet,
    ScrycardsTooltips,
} from "codemirror-lang-scrycards";
import { Button } from "@/components/(ui)/button";
import { Copy, PencilLine, Search, TextSearch } from "lucide-react";
import { SimpleToolTip } from "./tooltip";
import { cn } from "@/lib/utils";
import {
    IEditorQueriesContext,
    useEditorQueriesContext,
} from "@/context/editor-queries";
import { useEditorSettingsContext } from "@/context/editor-settings";
import { getCatalogWithSettings } from "@/lib/scrycards";
import { LanguageSupport } from "@codemirror/language";

function QueryWrapper({
    children,
    node,
    offset,
    editorRef,
}: {
    children: ReactNode;
    node: Node;
    offset: number;
    editorRef: RefObject<ReactCodeMirrorRef | null>;
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
                    top:
                        rect.top -
                        (editorRef.current?.view?.documentTop ?? 0) +
                        3,
                    left: rect.x + rect.width + 4,
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
    query: { node, offset, active, computed_query, query },
    i,
    editorRef,
}: {
    query: IEditorQueriesContext["queryNodes"][number];
    i: number;
    editorRef: RefObject<ReactCodeMirrorRef | null>;
}) {
    const { activateQuery } = useEditorQueriesContext();

    const content = useMemo(() => {
        return (
            <>
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
                <SimpleToolTip text="Edit">
                    <Button
                        className="w-0.5 h-0.5"
                        variant="outline"
                        onClick={() => {
                            editorRef.current?.view?.dispatch({
                                selection: {
                                    anchor: query.body.from,
                                    head: query.body.to,
                                },
                            });
                            editorRef.current?.view?.focus();
                        }}
                    >
                        <PencilLine />
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
            </>
        );
    }, [
        active,
        i,
        activateQuery,
        computed_query,
        query.body.from,
        query.body.to,
        editorRef,
    ]);

    return (
        <QueryWrapper node={node} offset={offset} editorRef={editorRef}>
            {content}
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

    const scrycards = useMemo(() => {
        return new LanguageSupport(scrycardsLanguage, [
            scrycardsLanguage.data.of({ autocomplete: completeScrycards }),
        ]);
    }, []);

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
            scrycards,
            scrycardsCatalogFacet.of(getCatalogWithSettings(catalog, settings)),
            scrycardsSettingsFacet.of({
                autoDetail: !settings.disableAutocompleteDetail,
                autoInfo: !settings.disableAutocompleteInfo,
            }),
            EditorView.lineWrapping,
        ];

        if (!settings.disableTooltips) {
            extensions.push(ScrycardsTooltips);
        }

        return extensions;
    }, [catalog, settings, scrycards]);

    const queryComponents = useMemo(
        () =>
            queryNodes.map((queryNode, i) => (
                <QueryNode
                    key={i}
                    query={queryNode}
                    i={i}
                    editorRef={editorRef}
                />
            )),
        [queryNodes]
    );

    return (
        <>
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
                {children}
                {queryComponents}
            </ReactCodeEditor>
        </>
    );
}
