import { Button } from "@/components/(ui)/button";
import { Textarea } from "@/components/(ui)/textarea";
import { queryAI } from "@/lib/ai";
import { ICatalog } from "codemirror-lang-scrycards";
import { LoaderCircle, SendHorizonal } from "lucide-react";
import { useState } from "react";

export function AIPrompter({
    // doc,
    // setDoc,
    addQuery,
    catalog,
}: {
    doc: string;
    setDoc: (doc: string) => void;
    addQuery: (props: { name: string; body: string }) => void;
    catalog: ICatalog;
}) {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<null | string>(null);
    const disabled = prompt === "" || loading;

    return (
        <div className="mr-13 md:mr-0 mt-2 md:mt-0 w-full xl:w-2xl flex flex-col items-center gap-2 bg-background">
            <div className="w-full relative">
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        if (!prompt) {
                            return;
                        }
                        setLoading(true);
                        setError(null);
                        const resp = await queryAI(prompt, catalog);
                        setLoading(false);
                        if (!resp) {
                            setError("[gemini] request failed.");
                            return;
                        }
                        const { func, text } = resp;

                        if (!func || Array.isArray(func)) {
                            console.error("[gemini]", resp);
                            setError("[gemini] didn't call add_query.");
                            return;
                        }
                        console.log(`[gemini] "${text ?? ""}"`, resp);
                        if (!func.args) return;
                        if (func.name !== "add_query") {
                            return;
                        }
                        if (!func.args) {
                            console.error(
                                "[gemini] no args provided to add_query"
                            );
                            setError("[gemini] no args provided to add_query");
                            return;
                        }
                        setPrompt("");
                        addQuery(func.args as { name: string; body: string });
                    }}
                >
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
                        {loading ? (
                            <LoaderCircle className="animate-spin" />
                        ) : (
                            <SendHorizonal />
                        )}
                    </Button>
                </form>
            </div>
            {error && <p>{error}</p>}
        </div>
    );
}
