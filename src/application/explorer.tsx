import { useSignal } from "@preact/signals";
import { Dropdown } from "~/desktop/dropdown/dropdown";
import { FileIcon, getFaviconForPath } from "~/desktop/fileicon/fileicon";
import iconUrl from "~/images/icons/favicons/joystick.png";
import { getFilesInPath } from "~/os/filesystem";
import { ProcessDescription } from "~/os/processes";
import { closeWindowForProcess, openWindowForProcess, WindowState } from "~/os/windows";
import "./explorer.css";
import "./notepad/notepad.css";
import type { Process } from "./process";
import "./todo.css";

type ExplorerState = undefined;

interface ExplorerWindowProps {
    process: Process<ExplorerState>;
    window: WindowState<ExplorerState>;
}
function ExplorerWindow({ process, window }: ExplorerWindowProps) {
    const location = useSignal<string>(window.windowParams);
    const filesInPath = getFilesInPath(location.value);
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
                    <FileIcon file={file} key={file.filename} />
                ))}
            </section>
            <section class="fileDetails">
                    File size: 0
            </section>
        </div>
    );
}

export const explorerAppDescription: ProcessDescription<ExplorerState> = {
    initialState: undefined,
    name: "explorer.exe",
    onOpen: (process, file) => {
        const location: string | undefined = file?.shortcutProperties?.params.initialLocation ?? file?.filename;
        console.log("open", location);

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
