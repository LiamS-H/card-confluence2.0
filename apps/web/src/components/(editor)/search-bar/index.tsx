import { SimpleToolTip } from "@/components/(ui)/tooltip";
import { Button } from "@/components/(ui)/button";
import { SearchSettings } from "@/lib/scryfall";

import { Sparkles, SquareCode } from "lucide-react";
import { Order } from "./order";

export function SearchBar({
    aiOpen,
    setAiOpen,
    scryfallSettings,
    computedSettings,
    setScryfallSettings,
}: {
    aiOpen: boolean;
    setAiOpen: (s: (o: boolean) => boolean) => void;
    scryfallSettings: SearchSettings;
    computedSettings?: SearchSettings;
    setScryfallSettings: (s: (s: SearchSettings) => SearchSettings) => void;
}) {
    return (
        <div className="absolute top-full p-2 flex items-center gap-2">
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
        </div>
    );
}
