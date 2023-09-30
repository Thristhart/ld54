import { signal } from "@preact/signals";
import { Process } from "~/application/process";

export const processes = signal<Process<unknown>[]>([]);

export function createProcess<State>(initialState: State): Process<State> {
    return {
        state: signal(initialState),
        windows: {},
    };
}
