import { ProcessDescription } from "~/os/processes";
import { WindowState, closeWindowForProcess, focusWindow, openWindowForProcess } from "~/os/windows";
import iconUrl from "~/images/icons/favicons/joystick.png";
import { File, createFile, openFile } from "~/os/filesystem";
import sidebarUrl from "~/images/installer_sidebar.png";
import { Signal, useSignal } from "@preact/signals";
import { cassieAppDescription } from "./cassie";

interface InstallerPageProps {
    pageIndex: Signal<number>;
    window: WindowState<undefined>;
}
function CassieInstallerIntroPage({ pageIndex, window }: InstallerPageProps) {
    return (
        <>
            <div class="installerPage">
                <img src={sidebarUrl} />
                <section class="installerPageContents">
                    <h1>Welcome to LANPlanner!</h1>
                    <p>
                        This installation wizard will guide you through the process of installing LANPlanner for Windows
                        LD on your computer. To continue, click Next.
                    </p>
                </section>
            </div>
            <div class="installerNavButtons">
                <button class="xpButton" onClick={() => pageIndex.value++}>
                    Next &gt;
                </button>
                <button class="xpButton" onClick={() => closeWindowForProcess(window.process, window.windowId)}>
                    Cancel
                </button>
            </div>
        </>
    );
}
function CassieInstallerShortcutsPage({ pageIndex, window }: InstallerPageProps) {
    const startMenu = useSignal(true);
    const desktop = useSignal(true);
    return (
        <>
            <div class="installerPage">
                <img src={sidebarUrl} />
                <section class="installerPageContents installerShortcutsPage">
                    <h1>Shortcut Options</h1>
                    <label>
                        <input
                            type="checkbox"
                            checked={startMenu.value}
                            onChange={(e) => (startMenu.value = (e.target as HTMLInputElement).checked)}
                        />{" "}
                        Add to Start Menu
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={desktop.value}
                            onChange={(e) => (desktop.value = (e.target as HTMLInputElement).checked)}
                        />{" "}
                        Create a shortcut on my desktop
                    </label>
                </section>
            </div>
            <div class="installerNavButtons">
                <button
                    class="xpButton"
                    onClick={() => {
                        closeWindowForProcess(window.process, window.windowId);
                        if (startMenu.value) {
                            // add to start menu
                        }
                        if (desktop.value) {
                            createFile(cassieShortcutFile);
                            createFile(cassieProgramFile);
                        }
                    }}>
                    Finish
                </button>
                <button class="xpButton" onClick={() => closeWindowForProcess(window.process, window.windowId)}>
                    Cancel
                </button>
            </div>
        </>
    );
}

const pages = [CassieInstallerIntroPage, CassieInstallerShortcutsPage];

interface WindowProps {
    window: WindowState<undefined>;
}
function CassieInstallerWindow(props: WindowProps) {
    const pageIndex = useSignal(0);

    const PageComponent = pages[pageIndex.value];
    return (
        <div class="installerWindow">
            <PageComponent window={props.window} pageIndex={pageIndex} />
        </div>
    );
}

export const cassieInstallerDescription: ProcessDescription<undefined> = {
    initialState: undefined,
    name: "lanplanner.exe",
    onOpen: (process) => {
        const windows = Object.values(process.windows);
        if (windows.length > 0) {
            focusWindow(windows[0].windowId);
        } else {
            openWindowForProcess(
                process,
                {
                    contentComponent: CassieInstallerWindow,
                    iconUrl,
                    initialTitle: "LANPlanner for Windows LD - Installation Wizard",
                    disableResize: true,
                },
                undefined,
                {
                    width: 500,
                    height: 400,
                }
            );
        }
    },
};

export const cassieInstallerFile: File = {
    filename: "C:/Downloads/lanplanner.exe",
    filesize: 100,
    shortcutProperties: {
        processDesc: cassieInstallerDescription,
        displayName: "lanplanner.exe",
    },
};

const cassieShortcutFile: File = {
    filename: "C:/Desktop/LANPlanner.lnk",
    filesize: 0,
    shortcutProperties: {
        processDesc: cassieAppDescription,
        displayName: "LANPlanner",
    },
};

const cassieProgramFile: File = {
    filename: "C:/Program Files/LANPlanner/LANPlanner.exe",
    filesize: 300,
    shortcutProperties: {
        processDesc: cassieAppDescription,
        displayName: "LANPLanner",
    },
};
