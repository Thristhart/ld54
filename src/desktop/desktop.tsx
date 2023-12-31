import { getFilesInPath } from "~/os/filesystem";
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
                {getFilesInPath("C:/Desktop").map((file) => (
                    <FileIcon file={file} key={file.filename} />
                ))}
            </div>
            {windowsToRender.map((window, index) => (
                <Window window={window} key={window.windowId} isFocused={index === windowsToRender.length - 1} />
            ))}
            <Taskbar focused={windowsToRender[windowsToRender.length - 1]} />
        </div>
    );
}
