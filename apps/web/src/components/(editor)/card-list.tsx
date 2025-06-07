import { useDebounce } from "@/hooks/useDebounce";
import { useSearch } from "@/hooks/useSearch";
import { Card } from "./card";
import { useCallback, useMemo } from "react";
export function CardList({
    query,
    ast,
}: {
    query: string;
    ast: string | undefined;
}) {
    const { search, result, error, warning, isLoading } = useSearch();

    useDebounce(
        useCallback(() => {
            if (!query) return;
            search({ query, ast, settings: {} });
        }, [search, query, ast]),
        750
    );

    const memoized_list = useMemo(
        () => (
            <>
                {error && (
                    <div className="w-fit p-4">
                        <div className="p-1 rounded-sm bg-secondary">
                            <div className="flex px-2 rounded-sm gap-2 bg-destructive items-end">
                                <h2 className="text-2xl text-primary-foreground">
                                    {error.status}
                                </h2>
                                <h1 className="text-primary-foreground/50">
                                    {error.code}
                                </h1>
                            </div>
                            <p className="text-destructive">
                                {error.details.split(" ").map((w) => {
                                    if (w.startsWith("https://scryfall.com/")) {
                                        const link = `https://scryfall.com/${w.slice(20)}`;
                                        return (
                                            <a
                                                key={w}
                                                className="text-secondary-foreground hover:text-secondary-foreground/50"
                                                target="_blank"
                                                href={link}
                                            >
                                                {link}{" "}
                                            </a>
                                        );
                                    }
                                    return w + " ";
                                })}
                            </p>
                        </div>
                    </div>
                )}
                {warning && (
                    <div>
                        <ul className="flex flex-row flex-wrap w-4xl gap-1">
                            {warning.map((w) => (
                                <li
                                    key={w}
                                    className="w-fit p-1 rounded-sm bg-secondary text-destructive"
                                >
                                    {w}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mr-4 flex flex-wrap h-full gap-1 overflow-y-auto">
                    {isLoading ? (
                        <p>loading...</p>
                    ) : (
                        result?.data.map((c) => <Card id={c} key={c} />)
                    )}
                </div>
            </>
        ),
        [result, error, warning, isLoading]
    );

    return memoized_list;
}
