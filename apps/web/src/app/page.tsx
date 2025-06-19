import { ScrycardsEditor } from "@/components/(editor)";
import { getCatalog } from "@/lib/scryfall";
// import { unstable_cacheLife as cacheLife } from "next/cache";

export default async function Home() {
    const catalog = await getCatalog();
    // cacheLife("days");
    return (
        <main className="h-full">
            <div className="h-full">
                <ScrycardsEditor catalog={catalog} />
            </div>
        </main>
    );
}
