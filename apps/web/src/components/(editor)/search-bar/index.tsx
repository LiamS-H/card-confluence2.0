import { Order } from "./order";
import { Progress } from "@/components/(ui)/progress";
import { Direction } from "./direction";
import { Unique } from "./unique";
import { ScrollTop } from "./scrolltop";

export function SearchBar({ progress }: { progress: number | null }) {
    return (
        <div className="w-full top-0 z-10 sticky">
            <Progress className="w-full rounded-none" value={progress} />

            <div className="flex justify-start items-center gap-2 p-2 w-full">
                <Order />
                <Direction />
                <Unique />

                {progress && <ScrollTop />}
            </div>
        </div>
    );
}
