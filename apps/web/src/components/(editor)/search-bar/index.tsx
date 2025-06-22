import { SimpleToolTip } from "@/components/(ui)/tooltip";
import { Button } from "@/components/(ui)/button";
import { ISearchSettings } from "@/lib/scryfall";

import { Sparkles, SquareCode } from "lucide-react";
import { Order } from "./order";
import { Progress } from "@/components/(ui)/progress";
import { Direction } from "./direction";
import { Unique } from "./unique";
import { ScrollTop } from "./scrolltop";

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
    scryfallSettings: ISearchSettings;
    computedSettings?: ISearchSettings;
    setScryfallSettings: (s: (s: ISearchSettings) => ISearchSettings) => void;
    progress: number | null;
}) {
    return (
        <div className="absolute top-full w-full">
            {progress !== null ? (
                <Progress className="w-full rounded-none" value={progress} />
            ) : (
                <div className="h-2" />
            )}
            <div className="flex justify-start items-center gap-2 p-2 w-full">
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
                <Direction
                    scryfallSettings={scryfallSettings}
                    setScryfallSettings={setScryfallSettings}
                    computedSettings={computedSettings}
                />
                <Unique
                    scryfallSettings={scryfallSettings}
                    setScryfallSettings={setScryfallSettings}
                    computedSettings={computedSettings}
                />
                {progress && <ScrollTop />}
            </div>
        </div>
    );
}
