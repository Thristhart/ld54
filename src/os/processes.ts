import { signal } from "@preact/signals";
import { Process } from "~/application/process";
import { File } from "./filesystem";

export const processes = signal<Process<unknown>[]>([]);
(window as any).processes = processes;

export function createProcess<State>({ initialState, name, onOpen }: ProcessDescription<State>): Process<State> {
    const process = {
        state: signal(initialState),
        name,
        windows: {},
        onOpen,
    };
    processes.value = [...processes.value, process];
    return process;
}

export function getOrCreateProcess<State>(desc: ProcessDescription<State>): Process<State> {
    return (processes.value.find((proc) => proc.name === desc.name) as Process<State>) ?? createProcess(desc);
}

export interface ProcessDescription<State> {
    initialState: State;
    name: string;
    onOpen(process: Process<State>, file?: File): void;
}
