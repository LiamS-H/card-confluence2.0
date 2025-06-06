import { useCard } from "@/hooks/useCard";
import { Scrycard } from "react-scrycards";

export function Card({ id }: { id: string }) {
    const card = useCard(id);

    return <Scrycard animated flippable card={card} size="lg" />;
}
