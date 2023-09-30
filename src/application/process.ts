import { Signal } from "@preact/signals";
import { FunctionComponent } from "preact";

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
export interface Process<State> {
    windows: { [windowId: string]: WindowState<unknown> };
    state: Signal<State>;
}
