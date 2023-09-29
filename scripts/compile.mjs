import * as esbuild from "esbuild";
import fs from "node:fs/promises";

export async function Compile( context )
{
    if (!context)
    {
        context = await esbuild.context({
            entryPoints: ["./src/main.tsx"],
            outdir: "./dist",
            platform: "browser",
            bundle: true,
        })
    }

    await context.rebuild();
    
    await fs.copyFile("./src/index.html", "./dist/index.html");

    return context;
}