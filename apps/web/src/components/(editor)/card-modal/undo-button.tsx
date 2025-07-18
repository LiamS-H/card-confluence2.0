import { Button } from "@/components/(ui)/button";
import { useCard } from "@/hooks/useCard";
import { Undo2 } from "lucide-react";

export function UndoButton({
    undo,
    prevId,
}: {
    undo: () => void;
    prevId: string;
}) {
    const card = useCard(prevId);
    return (
        <Button variant="destructive" onClick={undo}>
            Back{card ? ` to ${card.name}` : " loading..."}
            <Undo2 className="ml-2" />
        </Button>
    );
}
