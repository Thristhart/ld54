import watcher from "@parcel/watcher";
import { Compile } from "./compile.mjs";

let bIsBuilding = false;
let context;
async function Build() {
    bIsBuilding = true;
    console.log(`[${new Date().toLocaleTimeString()}]`, "build started");
    context = await Compile(context);
    bIsBuilding = false;
    return context;
}

let startBuildTimeout;
function DebouncedBuild() {
    if (bIsBuilding) {
        return;
    }
    if (startBuildTimeout) {
        clearTimeout(startBuildTimeout);
    }
    startBuildTimeout = setTimeout(Build, 300);
}

await watcher.subscribe("./src", DebouncedBuild);

await Build();

const { host, port } = await context.serve({
    servedir: "dist",
});
console.log(`serving on http://${host}:${port}`);
