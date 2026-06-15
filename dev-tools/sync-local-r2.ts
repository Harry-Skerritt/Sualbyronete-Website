// dev-tools/sync-local-r2.ts
import fs from 'node:fs';
import path from 'node:path';
import { Miniflare } from 'miniflare';

async function seedWranglerRegistry() {
    console.log("🔄 Initializing local R2 indexer...");

    // Hook directly into Miniflare using the exact lowercase folder structure
    const mf = new Miniflare({
        modules: true,
        script: `export default { fetch() {} }`,
        r2Buckets: { SUALBYRONETE_MEDIA: "sualbyronete-media" },
        r2Persist: "./.wrangler/state/v3/r2"
    });

    const bucket = await mf.getR2Bucket("SUALBYRONETE_MEDIA") as any;
    // FIXED: Corrected folder casing to match your terminal printout exactly
    const targetBaseDir = path.resolve(process.cwd(), './.wrangler/state/v3/r2/sualbyronete-media/images');

    if (!fs.existsSync(targetBaseDir)) {
        console.error(`❌ Target directory not found at: ${targetBaseDir}`);
        await mf.dispose();
        return;
    }

    async function processDirectory(currentPath: string, typeNamespace: string) {
        const items = fs.readdirSync(currentPath);

        for (const item of items) {
            const fullPath = path.join(currentPath, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                await processDirectory(fullPath, `${typeNamespace}/${item}`);
            } else {
                // Ignore hidden system files like .DS_Store on macOS
                if (item.startsWith('.')) continue;

                const fileKey = `images/${typeNamespace}/${item}`;
                const fileBuffer = fs.readFileSync(fullPath);

                console.log(`📡 Registering key -> ${fileKey}`);

                // This call writes to the SQLite DB and handles blob formatting for you
                await bucket.put(fileKey, fileBuffer, {
                    httpMetadata: {
                        contentType: item.endsWith('.png') ? 'image/png' : 'image/jpeg'
                    }
                });
            }
        }
    }

    const namespaces = fs.readdirSync(targetBaseDir);
    for (const namespace of namespaces) {
        const subPath = path.join(targetBaseDir, namespace);
        if (fs.statSync(subPath).isDirectory()) {
            await processDirectory(subPath, namespace);
        }
    }

    console.log("✅ Sync complete! All local files are indexed into Wrangler's SQLite registry.");
    await mf.dispose();
}

seedWranglerRegistry().catch(console.error);