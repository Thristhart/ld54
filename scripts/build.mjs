import * as esbuild from "esbuild";
import fs from "node:fs/promises";

await esbuild.build({
    entryPoints: ["./src/main.tsx"],
    outdir: "./dist",
    platform: "browser"
})

await fs.copyFile("./src/index.html", "./dist/index.html")