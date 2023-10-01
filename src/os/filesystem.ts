import { Signal, signal } from "@preact/signals";
import { buttonDescription } from "~/application/button";
import { cassieAppDescription } from "~/application/cassie/cassie";
import { chatterDescription } from "~/application/chatter";
import { explorerAppDescription } from "~/application/explorer";
import { minesweeperDescription } from "~/application/Minesweeper";
import { todoAppDescription } from "~/application/todo";
import { getOrCreateProcess, ProcessDescription } from "./processes";
import { steamAppDescription } from "~/application/steam/steam";

export interface File {
    readonly filename: string;
    readonly contents?: string;
    readonly filesize: number;
    readonly shortcutProperties?: {
        readonly processDesc: ProcessDescription<unknown>;
        readonly displayName: string;
        readonly params?: any;
    };
}

export const totalSize = 10000; //10GB

export const files = signal<Signal<File>[]>([
    signal({
        filename: "C:/Desktop/Button.lnk",
        filesize: 10,
        shortcutProperties: {
            processDesc: buttonDescription,
            displayName: "Button",
        },
    }),
    signal({
        filename: "C:/Desktop/todo.txt",
        filesize: 1,
        shortcutProperties: {
            processDesc: todoAppDescription,
            displayName: "todo.txt",
        },
    }),
    signal({
        filename: "C:/Desktop/Minesweeper.lnk",
        filesize: 10,
        shortcutProperties: {
            processDesc: minesweeperDescription,
            displayName: "Minesweeper",
        },
    }),
    signal({
        filename: "C:/Desktop/chatter.lnk",
        filesize: 30,
        shortcutProperties: {
            processDesc: chatterDescription,
            displayName: "Chatter",
        },
    }),
    signal({
        filename: "C:/Desktop/explorer.lnk",
        filesize: 15,
        shortcutProperties: {
            processDesc: explorerAppDescription,
            displayName: "My Computer",
            params: {
                initialLocation: "My Computer",
            },
        },
    }),
    signal({
        filename: "C:/Desktop/Cassie.lnk",
        filesize: 300,
        shortcutProperties: {
            processDesc: cassieAppDescription,
            displayName: "Cassie",
        },
    }),
    signal({
        filename: "C:/Desktop/Steam.lnk",
        filesize: 4000,
        shortcutProperties: {
            processDesc: steamAppDescription,
            displayName: "Steam",
        },
    }),
    signal({
        filename: "My Computer/C:/",
        filesize: 0,
        shortcutProperties: {
            processDesc: explorerAppDescription,
            displayName: "Local Disk (C:)",
            params: {
                initialLocation: "C:/",
            },
        },
    }),
]);

export function getFilesInPath(path: string) {
    const matchingFiles = files.value
        .filter((fileSignal) => fileSignal.value.filename.startsWith(path))
        .map((fileSignal) => fileSignal.value);
    const pathMap = new Map<string, File | "fillIn">();
    for (const match of matchingFiles) {
        let remainder = match.filename.substring(path.length);
        if (remainder.startsWith("/")) {
            remainder = remainder.substring(1);
        }
        const base = remainder.split("/", 2)[0];
        const childPath = path + (path.endsWith("/") ? "" : "/") + base;
        if (!pathMap.has(childPath) || pathMap.get(childPath) === "fillIn") {
            if (childPath === match.filename || childPath + "/" === match.filename) {
                pathMap.set(childPath, match);
            } else {
                pathMap.set(childPath, "fillIn");
            }
        }
    }
    const results: File[] = [];
    for (const [path, file] of pathMap) {
        if (file === "fillIn") {
            results.push({
                filename: path,
                filesize: 0,
            });
        } else {
            results.push(file);
        }
    }
    return results;
}

export function removeFile(file: File | undefined){
    if(file !== undefined)
    {
        files.value = files.value.filter(x => x.value !== file);
    }
}

function getProcessForFile(file: File) {
    if (file.shortcutProperties) {
        return getOrCreateProcess(file.shortcutProperties.processDesc);
    }

    // TODO: smarter selection
    return getOrCreateProcess(explorerAppDescription);
}

export function openFile(file: File) {
    const process = getProcessForFile(file);
    process.onOpen(process, file);
}
