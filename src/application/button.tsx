import { createProcess } from "~/os/processes";
import { openWindowForProcess } from "~/os/windows";
import { Process } from "./process";
import iconUrl from "~/images/icons/joystick.png";

type ButtonState = number;

interface ButtonWindowProps {
    process: Process<ButtonState>;
}
function ButtonWindow({ process }: ButtonWindowProps) {
    return <button onClick={() => process.state.value++}>click count: {process.state.value}</button>;
}

export function createButtonProcess() {
    return createProcess(0);
}
export function openButtonWindow(process: Process<number>) {
    return openWindowForProcess(process, {
        contentComponent: ButtonWindow,
        iconUrl,
        initialTitle: "Button!",
    });
}
