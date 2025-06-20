import { SimpleToolTip } from "@/components/(ui)/tooltip";
import { Button } from "@/components/(ui)/button";
import { SearchSettings } from "@/lib/scryfall";

import { ArrowUpToLine, Sparkles, SquareCode } from "lucide-react";
import { Order } from "./order";
import { Progress } from "@/components/(ui)/progress";

export function SearchBar({
    aiOpen,
    setAiOpen,
    scryfallSettings,
    computedSettings,
    setScryfallSettings,
    progress,
}: {
    aiOpen: boolean;
    setAiOpen: (s: (o: boolean) => boolean) => void;
    scryfallSettings: SearchSettings;
    computedSettings?: SearchSettings;
    setScryfallSettings: (s: (s: SearchSettings) => SearchSettings) => void;
    progress: number | null;
}) {
    return (
        <div className="absolute top-full w-full backdrop-blur-md">
            {progress !== null ? (
                <Progress className="w-full rounded-none" value={progress} />
            ) : (
                <div className="h-2" />
            )}
            <div className="flex items-center gap-2 p-2">
                <SimpleToolTip text={aiOpen ? "Editor Only" : "Open GenAI"}>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setAiOpen((o) => !o)}
                    >
                        {aiOpen ? <SquareCode /> : <Sparkles />}
                    </Button>
                </SimpleToolTip>
                <Order
                    scryfallSettings={scryfallSettings}
                    setScryfallSettings={setScryfallSettings}
                    computedSettings={computedSettings}
                />
                {progress && (
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                            window.scrollTo({ top: 0, behavior: "instant" })
                        }
                    >
                        <ArrowUpToLine />
                    </Button>
                )}
            </div>
        </div>
    );
}
