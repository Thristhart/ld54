import { Compile } from "./compile.mjs";

const context = await Compile();

await context.dispose();