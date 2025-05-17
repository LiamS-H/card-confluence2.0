"use client";
import ReactCodeEditor from "@uiw/react-codemirror";
import { keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { useState } from "react";
import { scrycards } from "codemirror-lang-scrycards";

const INITIAL = `game:arena is:permanent (o:draw or o:reveal)
o:enters (order:cmc (direction:arena (o:"test o" or o:/[\\/]+/)))
`;

export function ScrycardsEditor() {
    const [doc, setDoc] = useState(INITIAL);
    const extensions = [keymap.of(defaultKeymap), scrycards()];
    return (
        <ReactCodeEditor
            extensions={extensions}
            value={doc}
            onChange={(value, viewUpdate) => {
                setDoc(value);
            }}
        />
    );
}
