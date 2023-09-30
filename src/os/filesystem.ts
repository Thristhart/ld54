import { Signal, signal } from "@preact/signals";
import { buttonDescription } from "~/application/button";
import { cassieAppDescription } from "~/application/cassie/cassie";
import { chatterDescription } from "~/application/chatter";
import { minesweeperDescription } from "~/application/Minesweeper";
import { todoAppDescription } from "~/application/todo";
import { getOrCreateProcess, ProcessDescription } from "./processes";

export interface File {
    readonly filename: string;
    readonly contents?: string;
    readonly filesize: number;
    readonly shortcutProperties?: {
        readonly processDesc: ProcessDescription<unknown>;
        readonly displayName: string;
    };
}

export const files = signal<Signal<File>[]>([
    signal({
        filename: "C:/Desktop/Button.lnk",
        filesize: 0,
        shortcutProperties: {
            processDesc: buttonDescription,
            displayName: "Button",
        },
    }),
    signal({
        filename: "C:/Desktop/todo.txt",
        filesize: 0,
        shortcutProperties: {
            processDesc: todoAppDescription,
            displayName: "todo.txt",
        },
    }),
    signal({
        filename: "C:/Desktop/Minesweeper.lnk",
        filesize: 0,
        shortcutProperties: {
            processDesc: minesweeperDescription,
            displayName: "Minesweeper",
        },
    }),
    signal({
        filename: "C:/Desktop/chatter.lnk",
        filesize: 0,
        shortcutProperties: {
            processDesc: chatterDescription,
            displayName: "Chatter",
        },
    }),
    signal({
        filename: "C:/Desktop/Cassie.lnk",
        filesize: 0,
        shortcutProperties: {
            processDesc: cassieAppDescription,
            displayName: "Cassie",
        },
    }),
]);

export function getFilesInPath(path: string) {
    return files.value.filter((fileSignal) => fileSignal.value.filename.startsWith(path));
}

function getProcessForFile(file: File) {
    if (file.shortcutProperties) {
        return getOrCreateProcess(file.shortcutProperties.processDesc);
    }

    // TODO: smarter selection
    return getOrCreateProcess(buttonDescription);
}

export function openFile(file: File) {
    const process = getProcessForFile(file);
    process.onOpen(process, file);
}
