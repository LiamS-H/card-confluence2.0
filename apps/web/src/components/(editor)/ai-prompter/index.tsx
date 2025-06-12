import { Button } from "@/components/(ui)/button";
import { Textarea } from "@/components/(ui)/textarea";
import { queryAI } from "@/lib/ai";
import { SendHorizonal } from "lucide-react";
import { useState } from "react";

export function AIPrompter({
    doc,
    setDoc,
}: {
    doc: string;
    setDoc: (doc: string) => void;
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
