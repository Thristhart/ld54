import { Signal, signal } from "@preact/signals";
import { FunctionComponent } from "preact";
import { Process } from "~/application/process";

interface WindowContentComponentProps<State> {
    process: Process<State>;
}

export interface WindowDescription<State> {
    contentComponent: FunctionComponent<WindowContentComponentProps<State>>;
}
export interface WindowState<State> extends WindowDescription<State> {
    process: Process<State>;
    windowId: number;
    lastInteractionTime: Signal<number>;
    initialPosition: { x: number; y: number };
}

export const windows = signal<{ [windowId: string]: WindowState<unknown> }>({});

let globalWindowId = 0;
export function openWindowForProcess<State>(
    process: Process<State>,
    window: WindowDescription<State>,
    initialPosition: { x: number; y: number } = { x: 100, y: 100 }
) {
    const windowWithId: WindowState<State> = {
        ...window,
        process,
        windowId: globalWindowId++,
        lastInteractionTime: signal(performance.now()),
        initialPosition,
    };
    windows.value = { ...windows.value, [windowWithId.windowId]: windowWithId };
    process.windows = { ...process.windows, [windowWithId.windowId]: windowWithId };
    return windowWithId;
}

export function closeWindowForProcess(process: Process<unknown>, windowId: number) {
    const { [windowId]: _a, ...windowsWithoutWindow } = windows.value;
    const { [windowId]: _b, ...processWindowsWithoutWindow } = process.windows;

    windows.value = windowsWithoutWindow;
    process.windows = processWindowsWithoutWindow;
}
