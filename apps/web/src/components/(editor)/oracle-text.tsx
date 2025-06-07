import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { IScrysymbolMap, useScrycardsContext } from "react-scrycards";

function processTextToElements(
    text: string,
    symbols: Record<string, string>
): React.ReactNode[] {
    const parenthesesChunks = text.split(/(\(.*?\))/);
    const elements: React.ReactNode[] = [];

    parenthesesChunks.forEach((chunk, chunkIndex) => {
        if (!chunk) return;

        if (chunk.startsWith("(")) {
            const symbolElements = processSymbolsInText(
                chunk,
                symbols,
                `i-${chunkIndex}`
            );
            elements.push(<i key={`i-${chunkIndex}`}>{symbolElements}</i>);
        } else {
            const symbolElements = processSymbolsInText(
                chunk,
                symbols,
                `text-${chunkIndex}`
            );
            elements.push(...symbolElements);
        }
    });

    return elements;
}

function processSymbolsInText(
    text: string,
    symbols: Record<string, string>,
    keyPrefix: string
): React.ReactNode[] {
    const regex = /\{([^}]+)\}/g;
    let match;
    let lastIndex = 0;
    const elements: React.ReactNode[] = [];

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            const textChunk = text.slice(lastIndex, match.index);
            if (textChunk) elements.push(textChunk);
        }

        const symbolName = "{" + match[1]?.toUpperCase() + "}";
        const symbol = symbols[symbolName];

        if (symbol) {
            elements.push(
                <img
                    key={`${keyPrefix}-${match.index}`}
                    src={symbol}
                    alt={symbolName}
                    className="h-[1em] align-middle w-fit inline-block"
                />
            );
        } else {
            elements.push(match[0]);
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        const remainingText = text.slice(lastIndex);
        if (remainingText) elements.push(remainingText);
    }

    return elements;
}

export function OracleSpan({
    children,
    symbols,
    ...span_props
}: React.HTMLProps<HTMLSpanElement> & {
    children: string;
    symbols?: Record<string, string>;
}) {
    if (!children) return null;
    if (!symbols) return <span {...span_props}>{children}</span>;
    if (children.length === 0) {
        return <span {...span_props}>{children}</span>;
    }

    const elements = processTextToElements(children, symbols);

    return <span {...span_props}>{elements}</span>;
}

export function OracleText({
    children,
    className,
    ...div_props
}: React.HTMLProps<HTMLDivElement> & { children: string }) {
    const { getSymbols } = useScrycardsContext();
    const [symbols, setSymbols] = useState<IScrysymbolMap>();
    useEffect(() => {
        const request = getSymbols();
        if (request instanceof Promise) {
            request.then((c) => setSymbols(c));
        } else {
            setSymbols(request);
        }
    }, [getSymbols]);
    return (
        <div className={cn("flex flex-col", className)} {...div_props}>
            {children.split("\n").map((line: string, index: number) => {
                return (
                    <OracleSpan symbols={symbols} key={`oracle-line[${index}]`}>
                        {line}
                    </OracleSpan>
                );
            })}
        </div>
    );
}
