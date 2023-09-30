import { files, getFilesInPath } from "~/os/filesystem";
import { windows } from "~/os/windows";
import "./desktop.css";
import { FileIcon } from "./fileicon/fileicon";
import { Taskbar } from "./taskbar/taskbar";
import { Window } from "./window/window";

function getWindowsToRender() {
    return Object.values(windows.value).sort((a, b) => a.lastInteractionTime.value - b.lastInteractionTime.value);
}

export function Desktop() {
    const windowsToRender = getWindowsToRender();
    return (
        <div id="desktop">
            <div class="desktopIcons">
                {getFilesInPath("C:/Desktop").map((fileSignal) => (
                    <FileIcon file={fileSignal.value} key={fileSignal.value.filename} />
                ))}
            </div>
            {windowsToRender.map((window) => (
                <Window window={window} key={window.windowId} />
            ))}
            <Taskbar focused={windowsToRender[windowsToRender.length - 1]} />
        </div>
    );
}
