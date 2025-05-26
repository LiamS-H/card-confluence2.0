// prettier-ignore
export const ARGUMENTS = [ // (to keep this list somewhat organized)
    'oracle', 'o', 'fo', 'fulloracle',
    'type', 't',
    'set', 's', 'st', 'e', 'edition', 'in',
    'is', 'not',
    'power', 'pow',
    'toughness', 'tou',
    'powtou', 'pt', 
    'loyalty', 'loy',
    'mana', 'm', 'produces', 'devotion',
    'name',
    'color', 'c', 'id', 'commander',
    'keyword', 'kw',
    'cmc', 'mv', 
    'rarity', 'r', 
    'cube',
    'format', 'f', 'legal', 'banned', 'restricted',
    'artist', 'a', 
    'artists', 'illustrations', 'paperprints',
    'flavor', 'ft', 
    'watermark', 'wm', 
    'border',
    'frame',
    'stamp',
    'date', 'year',
    'atag', 'arttag', 'art', 
    'otag', 'oracletag', 'function', 
    'game',
] as const;

export type Argument = (typeof ARGUMENTS)[number];

export type ARG_TYPE =
    | "oracle"
    | "type"
    | "set"
    | "is"
    | "power"
    | "toughness"
    | "powtou"
    | "loyalty"
    | "mana"
    | "name"
    | "color"
    | "keyword"
    | "cmc"
    | "rarity"
    | "cube"
    | "format"
    | "artist"
    | "number"
    | "flavor"
    | "watermark"
    | "border"
    | "frame"
    | "stamp"
    | "date"
    | "atag"
    | "otag"
    | "game";

export function isArgument(string: string): string is Argument {
    return (ARGUMENTS as unknown as string[]).includes(string);
}

export const ARG_TYPE_MAP: Record<Argument, ARG_TYPE> = {
    o: "oracle",
    oracle: "oracle",
    fo: "oracle",
    fulloracle: "oracle",
    t: "type",
    type: "type",
    s: "set",
    st: "set",
    set: "set",
    e: "set",
    edition: "set",
    in: "set",
    is: "is",
    not: "is",
    pow: "power",
    power: "power",
    tou: "toughness",
    toughness: "toughness",
    pt: "powtou",
    powtou: "powtou",
    loy: "loyalty",
    loyalty: "loyalty",
    m: "mana",
    mana: "mana",
    produces: "mana",
    devotion: "mana",
    name: "name",
    c: "color",
    color: "color",
    id: "color",
    commander: "color",
    kw: "keyword",
    keyword: "keyword",
    mv: "cmc",
    cmc: "cmc",
    r: "rarity",
    rarity: "rarity",
    cube: "cube",
    f: "format",
    format: "format",
    legal: "format",
    banned: "format",
    restricted: "format",
    a: "artist",
    artist: "artist",
    artists: "number",
    illustrations: "number",
    paperprints: "number",
    ft: "flavor",
    flavor: "flavor",
    wm: "watermark",
    watermark: "watermark",
    border: "border",
    frame: "frame",
    stamp: "stamp",
    date: "date",
    year: "date",
    art: "atag",
    atag: "atag",
    arttag: "atag",
    function: "otag",
    otag: "otag",
    oracletag: "otag",
    game: "game",
};

export type OPERATOR_TYPE = "assert" | "all";

export interface ICompletionNode {
    operator: OPERATOR_TYPE;
    // arg_type: ARG_TYPE;
}

export interface ICompletionMap {
    nodes: Record<ARG_TYPE, ICompletionNode>;
}

export const COMPLETION_MAP: ICompletionMap = {
    nodes: {
        oracle: { operator: "assert" },
        type: { operator: "assert" },
        set: { operator: "assert" },
        is: { operator: "assert" },
        power: { operator: "all" },
        toughness: { operator: "all" },
        powtou: { operator: "all" },
        loyalty: { operator: "all" },
        mana: { operator: "all" },
        name: { operator: "assert" },
        color: { operator: "all" },
        keyword: { operator: "assert" },
        cmc: { operator: "all" },
        rarity: { operator: "assert" },
        cube: { operator: "assert" },
        format: { operator: "assert" },
        artist: { operator: "assert" },
        number: { operator: "all" },
        flavor: { operator: "assert" },
        watermark: { operator: "assert" },
        border: { operator: "assert" },
        frame: { operator: "assert" },
        stamp: { operator: "assert" },
        date: { operator: "all" },
        atag: { operator: "assert" },
        otag: { operator: "assert" },
        game: { operator: "assert" },
    },
};

export function nodeFromArg(arg: Argument): ICompletionNode {
    return COMPLETION_MAP.nodes[ARG_TYPE_MAP[arg]];
}

export function argTypeFromArg(arg: Argument): ARG_TYPE {
    return ARG_TYPE_MAP[arg];
}
