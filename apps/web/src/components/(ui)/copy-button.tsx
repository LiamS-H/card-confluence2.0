import { Check, Copy } from "lucide-react";
import { Button } from "./button";
import { useRef, useState } from "react";

export function CopyButton({
    text,
    ...props
}: React.ComponentProps<typeof Button> & { text: string }) {
    const [clicked, setClicked] = useState(false);
    const timeout = useRef<NodeJS.Timeout>(undefined);

    return (
        <Button
            className="w-0.5 h-0.5"
            variant="outline"
            {...props}
            onClick={() => {
                navigator.clipboard.writeText(text);
                setClicked(true);
                clearTimeout(timeout.current);
                timeout.current = setTimeout(() => {
                    setClicked(false);
                }, 500);
            }}
        >
            {clicked ? <Check /> : <Copy />}
        </Button>
    );
}
