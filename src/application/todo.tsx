import { ProcessDescription } from "~/os/processes";
import { openWindowForProcess } from "~/os/windows";
import type { Process } from "./process";
import iconUrl from "~/images/icons/favicons/joystick.png";

// this state might not actually end up living here
interface TodoState {
    readonly todos: string[];
}

interface TodoWindowProps {
    process: Process<TodoState>;
}
function TodoWindow({ process }: TodoWindowProps) {
    return <textarea></textarea>;
}

export const buttonDescription: ProcessDescription<TodoState> = {
    initialState: { todos: [] },
    name: "todos.exe",
    onOpen: (process) => {
        openWindowForProcess(process, {
            contentComponent: TodoWindow,
            iconUrl,
            initialTitle: "Button!",
        });
    },
};
