import path from "path";
import preact from "@preact/preset-vite";

export default {
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "src"),
        },
    },
    base: "/ld54/",
    plugins: [preact()],
};