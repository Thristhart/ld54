import { Signal } from "@preact/signals";
import { File } from "~/os/filesystem";
import { WindowState } from "~/os/windows";

export interface Process<State> {
    windows: { [windowId: string]: WindowState<unknown> };
    state: Signal<State>;
    name: string;
    onOpen(process: Process<State>, file: File): void;
}
