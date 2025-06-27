import { Button } from "@/components/(ui)/button";
import { SimpleToolTip } from "../tooltip";
import { ArrowUpToLine } from "lucide-react";
import { useEffect, useState } from "react";

const MIN_SCROLL = 200;

export function ScrollTop() {
    const [hidden, setHidden] = useState(() => window.scrollY < MIN_SCROLL);
    useEffect(() => {
        const controller = new AbortController();
        window.addEventListener(
            "scroll",
            () => {
                setHidden(window.scrollY < MIN_SCROLL);
            },
            {
                signal: controller.signal,
            }
        );
        return () => controller.abort();
    }, []);
    if (hidden) return null;

    return (
        <SimpleToolTip text="Scroll to top">
            <Button
                size="icon"
                variant="outline"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
            >
                <ArrowUpToLine />
            </Button>
        </SimpleToolTip>
    );
}
