import { useSignal } from "@preact/signals";
import { Dropdown } from "~/desktop/dropdown/dropdown";
import { FileIcon, getFaviconForPath, displayFilesize } from "~/desktop/fileicon/fileicon";
import iconUrl from "~/images/icons/favicons/joystick.png";
import { getFilesInPath, File, openFile, removeFile } from "~/os/filesystem";
import { ProcessDescription, getOrCreateProcess } from "~/os/processes";
import { closeWindowForProcess, openWindowForProcess, WindowState } from "~/os/windows";
import "./explorer.css";
import "./notepad/notepad.css";
import type { Process } from "./process";
import "./todo.css";
import { useCallback } from "react";

type ExplorerState = undefined;

interface ExplorerWindowProps {
    process: Process<ExplorerState>;
    window: WindowState<ExplorerState>;
}
function ExplorerWindow({ process, window }: ExplorerWindowProps) {
    const location = useSignal<string>(window.windowParams);
    const selectedFile = useSignal<File | undefined>(undefined);
    const filesInPath = getFilesInPath(location.value);
    const onKeyDown = useCallback(({ key }: KeyboardEvent) => {
        if (key === "Delete") {
            removeFile(selectedFile.value);
        }
    }, []);

    return (
        <div className={"explorerWindowContent"}>
            <Dropdown
                menu={{
                    File: {
                        New: {},
                        "Open...": {},
                        Save: { disabled: true },
                        "Save as...": { disabled: true },
                        "Page Setup...": {
                            disabled: true,
                        },
                        "Print...": {
                            disabled: true,
                        },
                        Exit: {
                            onClick() {
                                closeWindowForProcess(process, window.windowId);
                            },
                        },
                    },
                    Edit: {
                        "Undo...": { disabled: true },
                        Cut: { disabled: true },
                        Copy: { disabled: true },
                        Paste: { disabled: true },
                        Delete: { disabled: true },
                        "Time/Date": { disabled: true },
                    },
                    Format: {
                        "Word Wrap": { disabled: true },
                        Font: { disabled: true },
                    },
                    View: {
                        "Status Bar": { disabled: true },
                    },
                    Help: {
                        "Help Topics": { disabled: true },
                        "About Notepad": { disabled: true },
                    },
                }}
            />
            <section class="addressBar">
                <span class="addressLabel">Address</span>
                <span class="addressContents">
                    <img src={getFaviconForPath(location.value)} />
                    <span class="addressText">{location.value}</span>
                </span>
            </section>
            <section class="fileList">
                {filesInPath.map((file) => (
                    <FileIcon
                        file={file}
                        key={file.filename}
                        onFocus={() => {
                            selectedFile.value = file;
                        }}
                        onKeyDown={onKeyDown}
                        onDoubleClick={() => {
                            if (file.shortcutProperties) {
                                if (
                                    file.shortcutProperties.processDesc.name === "explorer.exe" &&
                                    file.shortcutProperties.params.initialLocation
                                ) {
                                    location.value = file.shortcutProperties.params.initialLocation;
                                } else {
                                    openFile(file);
                                }
                            } else {
                                location.value = file.filename;
                            }
                        }}
                    />
                ))}
            </section>
            <section class="fileDetails">
                File size: {displayFilesize(selectedFile.value?.filesize)}{" "}
                <button onClick={() => removeFile(selectedFile.value)}>Delete!</button>
            </section>
        </div>
    );
}

export function openExplorerAtPath(path: string) {
    openWindowForProcess(getOrCreateProcess(explorerAppDescription), {
        contentComponent: ExplorerWindow,
        iconUrl,
        initialTitle: `${path}`,
        minWidth: 350,
        minHeight: 150,
        windowParams: path,
    });
}

export const explorerAppDescription: ProcessDescription<ExplorerState> = {
    initialState: undefined,
    name: "explorer.exe",
    onOpen: (process, file) => {
        const location: string | undefined = file?.shortcutProperties?.params.initialLocation ?? file?.filename;

        openWindowForProcess(process, {
            contentComponent: ExplorerWindow,
            iconUrl,
            initialTitle: `${location ?? "Explorer"}`,
            minWidth: 350,
            minHeight: 150,
            windowParams: location,
        });
    },
};
