import { Button } from "@/components/(ui)/button";
import { Textarea } from "@/components/(ui)/textarea";
import { queryAI } from "@/lib/ai";
import { ICatalog } from "codemirror-lang-scrycards";
import { SendHorizonal } from "lucide-react";
import { useState } from "react";

export function AIPrompter({
    doc,
    setDoc,
    addQuery,
    catalog,
}: {
    doc: string;
    setDoc: (doc: string) => void;
    addQuery: (props: { name: string; body: string }) => void;
    catalog: ICatalog;
}) {
    const [prompt, setPrompt] = useState("");
    const disabled = prompt === "";

    return (
        <form
            onSubmit={async (e) => {
                e.preventDefault();
                if (!prompt) {
                    return;
                }
                const resp = await queryAI(prompt, catalog, doc);
                if (!resp) return;
                const { func, text } = resp;
                console.log(`[gemini] "${text ?? ""}"`, resp);
                if (!func.args) return;
                if (func.name === "add_query") {
                    if (!func.args) {
                        console.error("no args provided to add_query");
                        return;
                    }
                    addQuery(func.args as { name: string; body: string });
                }
            }}
        >
            <div className="pl-2 pr-13 flex flex-col items-center gap-2">
                <div className="w-full relative">
                    <Textarea
                        placeholder="Ask GenAI"
                        className="min-h-24"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <Button
                        className="absolute bottom-2 right-2"
                        size="icon"
                        variant={disabled ? "outline" : "default"}
                        disabled={disabled}
                        type="submit"
                    >
                        <SendHorizonal />
                    </Button>
                </div>
            </div>
        </form>
    );
}
