import "./desktop.css";
import { Taskbar } from "./taskbar/taskbar";
import { Window } from "./window/window";

export function Desktop() {
    return (
        <div id="desktop">
            <Window />
            <Taskbar />
        </div>
    );
}
