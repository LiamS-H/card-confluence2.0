import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/(ui)/accordion";
import { Button } from "@/components/(ui)/button";
import { useHighlightContext } from "@/context/highlight";
import { useCard } from "@/hooks/useCard";
import {
    ScryfallFrameEffectLike,
    ScryfallPromoType,
} from "@scryfall/api-types";
import {
    Blend,
    Bomb,
    Calendar1,
    CalendarFold,
    CopyPlus,
    Expand,
    FileDigit,
    Gift,
    Images,
    LoaderCircle,
    PartyPopper,
    Scale,
    Slice,
    Sparkles,
    SquaresExclude,
    Stamp,
    Theater,
    Ticket,
    Trophy,
} from "lucide-react";
import { SimpleToolTip } from "../tooltip";
import { useMemo } from "react";

export function Printings({
    id,
    printings,
}: {
    id: string;
    printings: string[] | null;
}) {
    const { replaceSelected, setHovered } = useHighlightContext();

    return useMemo(() => {
        if (printings?.length === 1) {
            return (
                <div className="py-4 border-b text-sm font-medium">
                    <div className="flex gap-2 items-center w-full">
                        <span>Printings</span>
                        <Printing id={id} />
                    </div>
                </div>
            );
        }
        return (
            <AccordionItem value={"printings"}>
                {printings ? (
                    <AccordionTrigger className="group hover:no-underline">
                        <div className="flex gap-2 items-center w-full">
                            <span className="group-hover:underline">
                                Printings
                            </span>
                            <Printing id={id} />
                        </div>
                    </AccordionTrigger>
                ) : (
                    <AccordionTrigger disabled noChevron>
                        <div className="flex gap-2 items-center w-full">
                            <span>Printings</span>
                            <Printing id={id} />
                        </div>
                        <LoaderCircle className="animate-spin" />
                    </AccordionTrigger>
                )}
                <AccordionContent>
                    {printings && printings.length > 1 && (
                        <ul className="max-h-52 overflow-y-auto">
                            {printings.map((p) => (
                                <li
                                    key={p}
                                    onMouseEnter={() => setHovered(p)}
                                    onMouseLeave={() => setHovered(null)}
                                >
                                    <Printing
                                        id={p}
                                        select={
                                            p !== id
                                                ? () => replaceSelected(p)
                                                : undefined
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </AccordionContent>
            </AccordionItem>
        );
    }, [printings, id, replaceSelected, setHovered]);
}

export function Printing({ id, select }: { id: string; select?: () => void }) {
    const card = useCard(id);

    const isSelected = !select;

    const content = useMemo(() => {
        if (!card) return <div>loading...</div>;
        let price: string | undefined;
        if (card.prices.usd) {
            price = `$${card.prices.usd}`;
            if (isSelected && card.prices.usd_foil) {
                price += ` / $${card.prices.usd_foil} F`;
            }
            // if (card.prices.usd_etched) {
            //     price += ` / $${card.prices.usd_etched} E`;
            // }
        } else if (card.prices.tix) {
            price = `${card.prices.tix} tix`;
        }
        return (
            <div className={`w-full flex flex-wrap justify-between`}>
                <div className="flex gap-2 items-center capitalize">
                    <span
                        className={`lg:max-w-96 md:max-w-32 sm:max-w-44 "max-w-44"  ${select ? "group-hover:underline truncate" : ""}`}
                    >
                        {card.set_name}
                    </span>
                    <span className="font-thin">
                        ({card.set.toUpperCase()})
                    </span>
                    <div className="flex gap-1">
                        {card.full_art && (
                            <SimpleToolTip text="Full Art">
                                <Expand className="h-4 text-muted-foreground" />
                            </SimpleToolTip>
                        )}

                        {card.promo_types?.map((f) => (
                            <PromoIcon key={f} promo={f} />
                        ))}
                        {card.frame_effects?.map((f) => (
                            <FrameIcon key={f} frame={f} />
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    {price && <span className="truncate">{price}</span>}
                </div>
            </div>
        );
    }, [select, card, isSelected]);

    if (isSelected) {
        return (
            <div className="w-full px-2 py-1 rounded-md group bg-secondary group-hover:bg-secondary/80">
                {content}
            </div>
        );
    }

    return (
        <Button
            className={`w-full h-6 px-2 group`}
            variant={"ghost"}
            onClick={select}
        >
            {content}
        </Button>
    );
}

function PromoIcon({ promo }: { promo: ScryfallPromoType }) {
    const iconClass = "h-4 w-4 text-muted-foreground";
    switch (promo) {
        case "alchemy":
        case "arenaleague":
            return (
                <SimpleToolTip text={promo}>
                    <span className={iconClass}>A</span>
                </SimpleToolTip>
            );
        case "boosterfun":
            return (
                <SimpleToolTip text={promo}>
                    <CopyPlus className={iconClass} />
                </SimpleToolTip>
            );
        case "buyabox":
        case "boxtopper":
        case "promopack":
            return (
                <SimpleToolTip text={promo}>
                    <PartyPopper className={iconClass} />
                </SimpleToolTip>
            );

        case "prerelease":
            return (
                <SimpleToolTip text={promo}>
                    <Calendar1 className={iconClass} />
                </SimpleToolTip>
            );
        case "stamped":
        case "datestamped":
            return (
                <SimpleToolTip text={promo}>
                    <Stamp className={iconClass} />
                </SimpleToolTip>
            );
        case "storechampionship":
        case "tourney":
            return (
                <SimpleToolTip text={promo}>
                    <Trophy className={iconClass} />
                </SimpleToolTip>
            );
        case "judgegift":
            return (
                <SimpleToolTip text={promo}>
                    <Scale className={iconClass} />
                </SimpleToolTip>
            );

        case "fnm":
        case "event":
        case "commanderparty":
        case "draftweekend":
        case "convention":
        case "instore":
            return (
                <SimpleToolTip text={promo}>
                    <Ticket className={iconClass} />
                </SimpleToolTip>
            );

        case "bringafriend":
            return (
                <SimpleToolTip text={promo}>
                    <CalendarFold className={iconClass} />
                </SimpleToolTip>
            );

        case "serialized":
            return (
                <SimpleToolTip text={promo}>
                    <FileDigit className={iconClass} />
                </SimpleToolTip>
            );
        case "playerrewards":
        case "wizardsplaynetwork":
            return (
                <SimpleToolTip text={promo}>
                    <Gift className={iconClass} />
                </SimpleToolTip>
            );

        case "brawldeck":
        case "bundle":
        case "concept":
        case "draculaseries":
        case "duels":
        case "gameday":
        case "giftbox":
        case "godzillaseries":
        case "intropack":
        case "jpwalker":
        case "league":
        case "mediainsert":
        case "moonlitland":
        case "openhouse":
        case "planeswalkerdeck":
        case "plastic":
        case "playpromo":
        case "poster":
        case "premiereshop":
        case "rebalanced":
        case "release":
        case "schinesealtart":
        case "scroll":
        case "setextension":
        case "setpromo":
        case "starterdeck":
        case "themepack":
        case "thick":
        case "glossy":
        case "silverfoil":
        case "confettifoil":
        case "galaxyfoil":
        case "halofoil":
        case "surgefoil":
        case "doublerainbow":
        case "textured":
        case "oilslick":
        case "neonink":
        case "gilded":
        case "stepandcompleat":
        case "embossed":
        case "ampersand":
            return <span className="text-muted-foreground">{promo}</span>;
    }
}

function FrameIcon({ frame }: { frame: ScryfallFrameEffectLike }) {
    const iconClass = "h-4 w-4 text-muted-foreground";
    switch (frame) {
        case "nyxtouched":
            return (
                <SimpleToolTip text="Nyx-touched">
                    <Sparkles className={iconClass} />
                </SimpleToolTip>
            );
        case "colorshifted":
            return (
                <SimpleToolTip text="Color-shifted">
                    <Blend className={iconClass} />
                </SimpleToolTip>
            );
        case "inverted":
            return (
                <SimpleToolTip text="Inverted">
                    <SquaresExclude className={iconClass} />
                </SimpleToolTip>
            );
        case "showcase":
            return (
                <SimpleToolTip text="Showcase">
                    <Theater className={iconClass} />
                </SimpleToolTip>
            );
        case "extendedart":
            return (
                <SimpleToolTip text="Extended Art">
                    <Images className={iconClass} />
                </SimpleToolTip>
            );
        case "etched":
            return (
                <SimpleToolTip text="Etched">
                    <Slice className={iconClass} />
                </SimpleToolTip>
            );
        case "shatteredglass":
            return (
                <SimpleToolTip text="Shattered Glass">
                    <Bomb className={iconClass} />
                </SimpleToolTip>
            );
    }
}
