import { ProcessDescription } from "~/os/processes";
import { focusWindow, openWindowForProcess } from "~/os/windows";
import iconUrl from "~/images/icons/favicons/joystick.png";
import { File } from "~/os/filesystem";

function CassieInstallerWindow() {
    return <span>Installer</span>;
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
                    initialTitle: "Cassie",
                    disableResize: true,
                    disableTitleBar: true,
                    transparent: true,
                },
                undefined,
                {
                    width: 200,
                    height: 200,
                }
            );
        }
    },
};

export const cassieInstallerFile: File = {
    filename: "C:/Desktop/lanplanner.exe",
    filesize: 100,
};
