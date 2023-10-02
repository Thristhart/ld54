import { signal } from "@preact/signals";
import { minesweeperDescription } from "~/application/Minesweeper";
import { browserAppDescription } from "~/application/browser/browser";
import { buttonDescription } from "~/application/button";
import { chatterDescription } from "~/application/chatter";
import { explorerAppDescription } from "~/application/explorer";
import { steamAppDescription } from "~/application/steam/steam";
import { todoAppDescription } from "~/application/todo";
import ieIcon from "~/images/icons/ie.png";
import minesweeperIcon from "~/images/icons/minesweeper.png";
import myComputerIcon from "~/images/icons/mycomputer.png";
import steamIcon from "~/images/icons/steam.png";
import { ProcessDescription, getOrCreateProcess } from "./processes";

export interface File {
    readonly filename: string;
    readonly contents?: string;
    readonly filesize: number;
    readonly shortcutProperties?: {
        readonly processDesc: ProcessDescription<unknown>;
        readonly displayName: string;
        readonly iconUrl?: string;
        readonly params?: any;
    };
}

export const totalSize = 10000; //10GB

export const myComputerShortcut = {
    filename: "C:/Desktop/MyComputer.lnk",
    filesize: 15,
    shortcutProperties: {
        processDesc: explorerAppDescription,
        displayName: "My Computer",
        iconUrl: myComputerIcon,
        params: {
            initialLocation: "My Computer",
        },
    },
};

export const files = signal<File[]>([
    {
        filename: "C:/Desktop/Button.lnk",
        filesize: 10,
        shortcutProperties: {
            processDesc: buttonDescription,
            displayName: "Button",
        },
    },
    {
        filename: "C:/Desktop/Minesweeper.lnk",
        filesize: 10,
        shortcutProperties: {
            processDesc: minesweeperDescription,
            displayName: "Minesweeper",
            iconUrl: minesweeperIcon,
        },
    },
    {
        filename: "C:/Desktop/chatter.lnk",
        filesize: 30,
        shortcutProperties: {
            processDesc: chatterDescription,
            displayName: "Chatter",
        },
    },
    myComputerShortcut,
    {
        filename: "C:/Desktop/Steam.lnk",
        filesize: 4000,
        shortcutProperties: {
            processDesc: steamAppDescription,
            displayName: "Steam",
            iconUrl: steamIcon,
        },
    },
    {
        filename: "C:/Program Files/Steam/steam.exe",
        filesize: 400,
        shortcutProperties: {
            processDesc: steamAppDescription,
            displayName: "steam.exe",
            iconUrl: steamIcon,
        },
    },
    {
        filename: "C:/Desktop/crashhandler.dll",
        filesize: 200,
    },
    {
        filename: "C:/Program Files/Steam/crashhandler.dll",
        filesize: 200,
    },
    {
        filename: "C:/Program Files/Steam/steamclient.dll",
        filesize: 200,
    },
    {
        filename: "C:/Program Files/Steam/vgui.dll",
        filesize: 200,
    },
    {
        filename: "C:/Desktop/InternetExplorer.lnk",
        filesize: 4000,
        shortcutProperties: {
            processDesc: browserAppDescription,
            displayName: "Internet Explorer",
            iconUrl: ieIcon,
        },
    },
    {
        filename: "My Computer/C:/",
        filesize: 0,
        shortcutProperties: {
            processDesc: explorerAppDescription,
            displayName: "Local Disk (C:)",
            params: {
                initialLocation: "C:/",
            },
        },
    },
    {
        filename: "C:/StartMenu/InternetExplorer.lnk",
        filesize: 0,
        shortcutProperties: {
            processDesc: browserAppDescription,
            displayName: "Internet Explorer",
            iconUrl: ieIcon,
        },
    },
    {
        filename: "C:/StartMenu/Minesweeper.lnk",
        filesize: 0,
        shortcutProperties: {
            processDesc: minesweeperDescription,
            displayName: "Minesweeper",
            iconUrl: minesweeperIcon,
        },
    },
    {
        filename: "C:/StartMenu/chatter.lnk",
        filesize: 0,
        shortcutProperties: {
            processDesc: chatterDescription,
            displayName: "Chatter",
        },
    },
    {
        filename: "C:/StartMenu/Steam.lnk",
        filesize: 0,
        shortcutProperties: {
            processDesc: steamAppDescription,
            displayName: "Steam",
            iconUrl: steamIcon,
        },
    },
]);

export function getFilesInPath(path: string) {
    const matchingFiles = files.value.filter((file) => file.filename.startsWith(path));
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

export function removeFile(file: File | undefined) {
    if (file !== undefined) {
        files.value = files.value.filter((x) => x !== file);
    }
}

import { Howl } from "howler";
import errorSoundUrl from "~/audio/win_alert.mp3";

const errorBeep = new Howl({
    src: [errorSoundUrl],
    volume: 0.3,
});

function getProcessForFile(file: File) {
    if (file.shortcutProperties) {
        return getOrCreateProcess(file.shortcutProperties.processDesc);
    }

    if (file.filename.endsWith("/")) {
        return getOrCreateProcess(explorerAppDescription);
    }

    return undefined;
}

export function openFile(file: File) {
    const process = getProcessForFile(file);
    if (!process) {
        errorBeep.play();
        return;
    }
    process.onOpen(process, file);
}

export function createFile(file: File) {
    if (files.value.includes(file)) {
        return;
    }
    files.value = [...files.value, file];
}
