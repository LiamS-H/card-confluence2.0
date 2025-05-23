import { ScrycardsEditor } from "@/components/(editor)/editor";
import { getCatalog } from "@/lib/scryfall";
// import { unstable_cacheLife as cacheLife } from "next/cache";

export default async function Home() {
    const catalog = await getCatalog();
    // cacheLife("days");
    return (
        <main className="w-full h-full">
            <div className="">
                <ScrycardsEditor catalog={catalog} />
            </div>
        </main>
    );
}
