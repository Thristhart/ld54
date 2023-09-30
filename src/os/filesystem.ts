import { Signal, signal } from "@preact/signals";
import { buttonDescription } from "~/application/button";
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
    process.onOpen(process, file.filename);
}
