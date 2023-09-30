import { Signal } from "@preact/signals";
import { WindowState } from "~/os/windows";

export interface Process<State> {
    windows: { [windowId: string]: WindowState<unknown> };
    state: Signal<State>;
}
