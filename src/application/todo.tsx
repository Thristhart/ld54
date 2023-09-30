import { ProcessDescription } from "~/os/processes";
import { focusWindow, openWindowForProcess } from "~/os/windows";
import type { Process } from "./process";
import iconUrl from "~/images/icons/favicons/joystick.png";
import "./notepad/notepad.css";
import "./todo.css";
import { getFileBasename } from "~/desktop/fileicon/fileicon";

// this state might not actually end up living here
interface TodoState {
    readonly todos: string[];
}

interface TodoWindowProps {
    process: Process<TodoState>;
}
function TodoWindow({ process }: TodoWindowProps) {
    return (
        <div className={"notepadWindowContent"}>
            <textarea class="notepadTextarea todoTextarea" disabled>
                [ ]: Ask Todd about the LAN party on AIM
            </textarea>
        </div>
    );
}

export const todoAppDescription: ProcessDescription<TodoState> = {
    initialState: { todos: [] },
    name: "todos.exe",
    onOpen: (process, file) => {
        const windows = Object.values(process.windows);
        if (windows.length > 0) {
            focusWindow(windows[0].windowId);
        } else {
            openWindowForProcess(process, {
                contentComponent: TodoWindow,
                iconUrl,
                initialTitle: `${file ? getFileBasename(file) : "Untitled"} - Notepad`,
            });
        }
    },
};