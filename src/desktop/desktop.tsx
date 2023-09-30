import { createButtonProcess, openButtonWindow } from "~/application/button";
import { windows } from "~/os/windows";
import "./desktop.css";
import { Taskbar } from "./taskbar/taskbar";
import { Window } from "./window/window";

function getWindowsToRender() {
    return Object.values(windows.value).sort((a, b) => a.lastInteractionTime.value - b.lastInteractionTime.value);
}

const testProcess = createButtonProcess();

export function Desktop() {
    return (
        <div id="desktop">
            {getWindowsToRender().map((window) => (
                <Window window={window} key={window.windowId} />
            ))}
            <Taskbar
                onClick={() => {
                    openButtonWindow(testProcess);
                }}
            />
        </div>
    );
}
