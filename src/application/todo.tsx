import { ProcessDescription } from "~/os/processes";
import { closeWindowForProcess, focusWindow, openWindowForProcess, WindowState } from "~/os/windows";
import type { Process } from "./process";
import iconUrl from "~/images/icons/favicons/joystick.png";
import "./notepad/notepad.css";
import "./todo.css";
import { getFileBasename } from "~/desktop/fileicon/fileicon";
import { Dropdown, MenuDescription } from "~/desktop/dropdown/dropdown";

// this state might not actually end up living here
interface TodoState {
    readonly todos: string[];
}

interface TodoWindowProps {
    process: Process<TodoState>;
    window: WindowState<TodoState>;
}
function TodoWindow({ process, window }: TodoWindowProps) {
    return (
        <div className={"notepadWindowContent"}>
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
            <textarea class="notepadTextarea todoTextarea" readonly>
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
                minWidth: 350,
                minHeight: 150,
            });
        }
    },
};