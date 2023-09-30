import { Signal, signal } from "@preact/signals";
import { FunctionComponent } from "preact";
import { Process } from "~/application/process";
import { taskbarHeight } from "~/desktop/taskbar/taskbar";

interface WindowContentComponentProps<State> {
    process: Process<State>;
    window: WindowState<State>;
}

export interface WindowDescription<State> {
    contentComponent: FunctionComponent<WindowContentComponentProps<State>>;
    iconUrl?: string;
    initialTitle: string;
    minWidth?: number;
    minHeight?: number;
    disableResize?: boolean;
}
export interface WindowState<State> extends WindowDescription<State> {
    process: Process<State>;
    windowId: number;
    lastInteractionTime: Signal<number>;
    position: Signal<{ x: number; y: number }>;
    size: Signal<{ width: number; height: number }>;
    title: Signal<string>;
    isMaximized: Signal<boolean>;
    isMinimized: Signal<boolean>;
    restoreDimensions?: {
        position: { x: number; y: number };
        size: { width: number; height: number };
    };
}

export const windows = signal<{ [windowId: string]: WindowState<unknown> }>({});

(window as any).windows = windows;

let globalWindowId = 0;
export function openWindowForProcess<State>(
    process: Process<State>,
    window: WindowDescription<State>,
    initialPosition: { x: number; y: number } = { x: 100, y: 100 },
    initialSize: { width: number; height: number } = { width: 400, height: 300 }
) {
    const maxHeight = globalThis.innerHeight - taskbarHeight - 20;
    const maxWidth = globalThis.innerWidth - 20;

    if (windows.value != undefined) {
        while (
            Object.values(windows.value).find(
                (w) => w.position.value.x == initialPosition.x && w.position.value.y == initialPosition.y
            )
        ) {
            initialPosition.x += 32;
            initialPosition.y += 32;
            if (initialPosition.y >= maxHeight) {
                initialPosition.y = 20;
            }
            if (initialPosition.x >= maxWidth) {
                initialPosition.x = 20;
            }
        }
    }

    const windowWithId: WindowState<State> = {
        ...window,
        process,
        windowId: globalWindowId++,
        lastInteractionTime: signal(performance.now()),
        position: signal(initialPosition),
        size: signal(initialSize),
        title: signal(window.initialTitle),
        isMaximized: signal(false),
        isMinimized: signal(false),
    };
    windows.value = { ...windows.value, [windowWithId.windowId]: windowWithId };
    process.windows = { ...process.windows, [windowWithId.windowId]: windowWithId };
    return windowWithId;
}

export function maximizeWindow(windowId: number) {
    const window = windows.value[windowId];
    if(window.disableResize)
    {
        return;
    }
    window.restoreDimensions = {
        position: window.position.value,
        size: window.size.value,
    };
    window.position.value = { x: 0, y: 0 };
    window.size.value = { width: globalThis.innerWidth, height: globalThis.innerHeight - taskbarHeight };
    window.isMaximized.value = true;
}

export function minimizeWindow(windowId: number) {
    const window = windows.value[windowId];
    window.isMinimized.value = true;
}
export function unminimizeWindow(windowId: number) {
    const window = windows.value[windowId];
    window.isMinimized.value = false;
}

export function restoreWindow(windowId: number) {
    const window = windows.value[windowId];
    if (window.restoreDimensions) {
        window.position.value = window.restoreDimensions.position;
        window.size.value = window.restoreDimensions.size;
    }
    window.isMaximized.value = false;
}

export function closeWindowForProcess(process: Process<unknown>, windowId: number) {
    const { [windowId]: _a, ...windowsWithoutWindow } = windows.value;
    const { [windowId]: _b, ...processWindowsWithoutWindow } = process.windows;

    windows.value = windowsWithoutWindow;
    process.windows = processWindowsWithoutWindow;
}

export function focusWindow(windowId: number) {
    const window = windows.value[windowId];
    if (window != undefined) {
        window.lastInteractionTime.value = performance.now();
    }
}
