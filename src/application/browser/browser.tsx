import { ProcessDescription } from "~/os/processes";
import { WindowState, closeWindowForProcess, focusWindow, openWindowForProcess } from "~/os/windows";
import type { Process } from "../process";
import iconUrl from "~/images/icons/favicons/ie.png";
import { Dropdown } from "~/desktop/dropdown/dropdown";
import "./browser.css";
import backIconUrl from "~/images/icons/back.png";
import forwardIconUrl from "~/images/icons/forward.png";
import ieFaviconUrl from "~/images/icons/favicons/ie.png";
import { useSignal } from "@preact/signals";
import { FunctionComponent } from "preact";
import { LanPlannerWebsite } from "./websites/lanfestcolumbus";
import { useEffect } from "preact/hooks";
import { File, createFile, files, openFile } from "~/os/filesystem";
import { getFileBasename } from "~/desktop/fileicon/fileicon";
import { openExplorerAtPath } from "../explorer";

type BrowserState = undefined;

interface Website {
    component: FunctionComponent<BrowserWindowProps>;
    address: string;
}

export interface BrowserWindowProps {
    process: Process<BrowserState>;
    window: WindowState<BrowserState>;
}
function BrowserWindow({ process, window }: BrowserWindowProps) {
    const browserHistory = useSignal<Website[]>([
        { address: "http://www.freewebs.com/lanfestcolumbus/", component: LanPlannerWebsite },
    ]);

    const historyIndex = useSignal(0);

    const currentPage = browserHistory.value[historyIndex.value];
    return (
        <div className={"browserWindowContent"}>
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
                        Close: {
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
                        "About Internet Explorer": { disabled: true },
                    },
                }}
            />
            <div class="browserFunctionBar">
                <button disabled>
                    <img src={backIconUrl} alt="back" /> Back
                </button>
                <button>
                    <img src={forwardIconUrl} alt="forward" />
                </button>
            </div>
            <section class="addressBar">
                <span class="addressLabel">Address</span>
                <span class="addressContents">
                    <img src={ieFaviconUrl} />
                    <span class="addressText">{currentPage.address}</span>
                </span>
            </section>
            <section class="pageContents">
                <currentPage.component process={process} window={window} />
            </section>
        </div>
    );
}

function DownloadWindow(props: BrowserWindowProps) {
    const file = props.window.windowParams as File;
    const installDuration = 1000;
    const isInstalled = files.value.includes(file);
    const installProgress = useSignal(isInstalled ? 1 : 0);

    // shrug emoji
    const barsThatFit = 45;

    useEffect(() => {
        if (isInstalled) {
            return;
        }

        let accumulatedTime = 0;
        let lastTick = performance.now();
        let installSpeed = 1;
        function tick(timestamp: number) {
            const dt = timestamp - lastTick;
            lastTick = timestamp;

            if (Math.random() < 0.5) {
                installSpeed = Math.random();
                if (installSpeed > 0.5) {
                    installSpeed *= 2;
                }
            }
            accumulatedTime += dt * installSpeed;
            let progress = accumulatedTime / installDuration;
            if (progress >= 1) {
                progress = 1;
                createFile(file);
            } else {
                animFrameHandle = requestAnimationFrame(tick);
            }
            installProgress.value = progress;
        }

        let animFrameHandle = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(animFrameHandle);
        };
    }, [isInstalled]);

    const basename = getFileBasename(file);
    return (
        <div className={"downloadWindowContent"}>
            <label className="downloadLabel">{basename}</label>
            <div class="installProgress">
                {Array.from({ length: Math.round(installProgress.value * barsThatFit) }, (_, index) => (
                    <div class="installBlock" key={index} />
                ))}
            </div>
            <label className="downloadDestinationLabel">Download to: {file.filename}</label>
            <div className="downloadWindowButtons">
                <button
                    onClick={() => {
                        openFile(file);
                        closeWindowForProcess(props.window.process, props.window.windowId);
                    }}>
                    Run
                </button>
                <button
                    onClick={() => {
                        openExplorerAtPath(file.filename.split(basename, 2)[0]);
                        closeWindowForProcess(props.window.process, props.window.windowId);
                    }}>
                    Open Folder
                </button>
                <button onClick={() => closeWindowForProcess(props.window.process, props.window.windowId)}>
                    Close
                </button>
            </div>
        </div>
    );
}

export function openBrowserDownloadWindow(process: Process<BrowserState>, file: File) {
    const windows = Object.values(process.windows);
    const installWindow = windows.find((window) => window.title.value.startsWith("File Download"));
    if (installWindow) {
        focusWindow(installWindow.windowId);
    } else {
        openWindowForProcess(
            process,
            {
                contentComponent: DownloadWindow,
                iconUrl,
                initialTitle: `File Download`,
                disableResize: true,
                windowParams: file,
            },
            undefined,
            { width: 380, height: 150 }
        );
    }
}

export const browserAppDescription: ProcessDescription<BrowserState> = {
    initialState: undefined,
    name: "browser.exe",
    onOpen: (process) => {
        openWindowForProcess(
            process,
            {
                contentComponent: BrowserWindow,
                iconUrl,
                initialTitle: "Internet Explorer",
                minWidth: 300,
                minHeight: 350,
            },
            undefined,
            {
                width: 500,
                height: 400,
            }
        );
    },
};
