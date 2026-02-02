import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/(ui)/accordion";
import { Button } from "@/components/(ui)/button";
import { CopyButton } from "@/components/(ui)/copy-button";
import { ExternalLink, LoaderCircle } from "lucide-react";

function Content({ tags, tagger }: { tags: string[]; tagger: string }) {
    return (
        <ul className="flex flex-wrap gap-1">
            {tags.map((tag, i) => {
                if (
                    i == tags.length - 1 &&
                    tag.startsWith("and") &&
                    tag.endsWith("more")
                ) {
                    return (
                        <li key={i}>
                            <a target="_blank" href={tagger}>
                                <Button variant="link">
                                    {tag}
                                    <ExternalLink />
                                </Button>
                            </a>
                        </li>
                    );
                }
                return (
                    <li
                        className="flex bg-secondary text-secondary-foreground p-2 rounded-md"
                        key={i}
                    >
                        <span className="px-1 text-left">{tag}</span>
                        <CopyButton
                            text={tag.split(" ").join("-")}
                            className="w-0.5 h-0.5"
                            variant="ghost"
                        />
                    </li>
                );
            })}
        </ul>
    );
}

export function Tags({
    tags,
    tagger,
    isOpen,
}: {
    tags: string[] | null;
    tagger: string;
    isOpen: boolean;
}) {
    const loading = isOpen && !tags;
    const no_tags = tags?.length === 0;
    return (
        <AccordionItem value={"tags"}>
            <AccordionTrigger
                disabled={loading || no_tags}
                noChevron={loading || no_tags}
            >
                <div className="flex items-center w-full">
                    <span>Tags</span>
                    {no_tags && <span>: None</span>}
                </div>
                {loading && <LoaderCircle className="animate-spin" />}
            </AccordionTrigger>
            <AccordionContent>
                {tags && !no_tags && <Content tags={tags} tagger={tagger} />}
            </AccordionContent>
        </AccordionItem>
    );
}
