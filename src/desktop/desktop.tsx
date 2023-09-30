import { windows } from "~/os/windows";
import "./desktop.css";
import { Taskbar } from "./taskbar/taskbar";
import { Window } from "./window/window";

function getWindowsToRender() {
    return Object.values(windows.value).sort((a, b) => a.lastInteractionTime.value - b.lastInteractionTime.value);
}

export function Desktop() {
    const windowsToRender = getWindowsToRender();
    return (
        <div id="desktop">
            {windowsToRender.map((window) => (
                <Window window={window} key={window.windowId} />
            ))}
            <Taskbar focused={windowsToRender[windowsToRender.length - 1]} />
        </div>
    );
}
