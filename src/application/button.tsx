import { ProcessDescription } from "~/os/processes";
import { openWindowForProcess } from "~/os/windows";
import type { Process } from "./process";
import iconUrl from "~/images/icons/favicons/joystick.png";

type ButtonState = number;

interface ButtonWindowProps {
    process: Process<ButtonState>;
}
function ButtonWindow({ process }: ButtonWindowProps) {
    return <button onClick={() => process.state.value++}>click count: {process.state.value}</button>;
}

export const buttonDescription: ProcessDescription<ButtonState> = {
    initialState: 0,
    name: "button.exe",
    onOpen: (process) => {
        openWindowForProcess(process, {
            contentComponent: ButtonWindow,
            iconUrl,
            initialTitle: "Button!",
        });
    },
};
