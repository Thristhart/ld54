import * as esbuild from "esbuild";
import fs from "node:fs/promises";

export async function Compile( dev, context )
{
    if (!context)
    {
        context = await esbuild.context({
            entryPoints: ["./src/main.tsx"],
            outdir: "./dist",
            platform: "browser",
            bundle: true,
            minify: !dev,
            define: {
                "process.env.NODE_ENV": JSON.stringify(dev ? "development" : "production")
            }
        })
    }

    await context.rebuild();
    
    await fs.copyFile("./src/index.html", "./dist/index.html");

    return context;
}