import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/(ui)/accordion";
import { ScryfallRuling } from "@scryfall/api-types";
import { LoaderCircle } from "lucide-react";
import { useMemo } from "react";

type Comp = {
    published_at: string;
    source: ScryfallRuling["source"][];
    comments: Omit<
        Omit<Omit<ScryfallRuling, "object">, "published_at">,
        "source"
    >[];
};

function Content({ rulings }: { rulings: ScryfallRuling[] }) {
    if (rulings.length === 0) return <span>none</span>;

    rulings = rulings.sort((r1, r2) => {
        if (r2.oracle_id !== r2.oracle_id)
            return r1.oracle_id.localeCompare(r2.oracle_id);
        return r1.published_at.localeCompare(r2.published_at);
    });

    const ruling_comps = useMemo(() => {
        const ruling_comps: Comp[] = [];
        let cur_comp: Comp | null = null;

        for (let i = 0; i < rulings.length; i++) {
            const {
                published_at: date,
                source,
                object: _,
                ...ruling
            } = rulings[i] as ScryfallRuling;

            if (!cur_comp) {
                cur_comp = {
                    comments: [{ ...ruling }],
                    published_at: date,
                    source: [source],
                };
                continue;
            }
            if (cur_comp.published_at !== date) {
                ruling_comps.push(cur_comp);
                cur_comp = {
                    comments: [{ ...ruling }],
                    published_at: date,
                    source: [source],
                };
                continue;
            }
            if (!cur_comp.source.includes(source)) {
                cur_comp.source.push(source);
            }
            cur_comp.comments.push({ ...ruling });
        }
        if (cur_comp) ruling_comps.push(cur_comp);
        return ruling_comps;
    }, [rulings]);

    return (
        <ul className="flex flex-col items-center">
            {ruling_comps.map((r) => (
                <div
                    key={r.published_at}
                    className="p-1 flex flex-col items-end max-w-96"
                >
                    <ul className="flex flex-col gap-1">
                        {r.comments.map((c, i) => (
                            <li
                                className="bg-secondary text-secondary-foreground p-2 rounded-md"
                                key={i}
                            >
                                <p className="px-1 text-left">{c.comment}</p>
                            </li>
                        ))}
                    </ul>
                    <span className="text-muted-foreground uppercase">
                        {r.published_at} {r.source.join(" & ")}
                    </span>
                </div>
            ))}
        </ul>
    );
}

export function Rulings({
    rulings,
    isOpen,
}: {
    rulings: ScryfallRuling[] | null;
    isOpen: boolean;
}) {
    const loading = isOpen && !rulings;
    const no_rulings = isOpen && rulings?.length === 0;
    return (
        <AccordionItem value={"rulings"}>
            <AccordionTrigger
                disabled={loading || no_rulings}
                noChevron={loading}
            >
                <div className="flex items-center w-full">
                    <span>Rulings</span>
                    {no_rulings && <span>: None</span>}
                </div>
                {loading && <LoaderCircle className="animate-spin" />}
            </AccordionTrigger>
            <AccordionContent>
                {rulings && !no_rulings && <Content rulings={rulings} />}
            </AccordionContent>
        </AccordionItem>
    );
}
