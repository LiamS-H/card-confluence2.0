import { Button } from "@/components/(ui)/button";
import { queryAI } from "@/lib/ai";
import { useState } from "react";

export function AIPrompter({
    doc,
    setDoc,
}: {
    doc: string;
    setDoc: (doc: string) => void;
}) {
    const [prompt, setPrompt] = useState("");

    return (
        <div>
            <input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            <Button
                onClick={async () => {
                    const resp = await queryAI(prompt, doc);
                    console.log("[gemini]", resp);
                    if (!resp) return;
                    const { func, text } = resp;
                    if (!func.args) return;
                    if (func.name === "set_doc") {
                        setDoc((func.args as { text: string }).text);
                    }
                }}
            >
                Submit
            </Button>
        </div>
    );
}
