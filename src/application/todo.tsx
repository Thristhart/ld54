import { ProcessDescription } from "~/os/processes";
import { closeWindowForProcess, focusWindow, openWindowForProcess, WindowState } from "~/os/windows";
import type { Process } from "./process";
import iconUrl from "~/images/icons/favicons/joystick.png";
import "./notepad/notepad.css";
import "./todo.css";
import { getFileBasename } from "~/desktop/fileicon/fileicon";
import { Dropdown } from "~/desktop/dropdown/dropdown";
import { signal } from "@preact/signals";
import { Games } from "./steam/steam";
import { files } from "~/os/filesystem";

// this state might not actually end up living here
type TodoState = undefined;

export interface TodoDescription {
    readonly displayText: string;
    readonly isSatisfied: () => boolean;
}
const todos = signal<TodoDescription[]>([
    {
        displayText: "Install Counter-Strike",
        isSatisfied: () => {
            return Games.counterStrike.files.every((file) => {
                return files.value.some((fileSignal) => fileSignal.value.filename === file.filename);
            });
        },
    },
]);

export function addTodo(todo: TodoDescription) {
    todos.value = [...todos.value, todo];
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
                {todos.value
                    .map((todo) => {
                        return `[${todo.isSatisfied() ? "X" : " "}] ${todo.displayText}`;
                    })
                    .join("\n")}
            </textarea>
        </div>
    );
}

export const todoAppDescription: ProcessDescription<TodoState> = {
    initialState: undefined,
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
