import { ProcessDescription } from "~/os/processes";
import { openWindowForProcess } from "~/os/windows";
import type { Process } from "./process";
import iconUrl from "~/images/icons/favicons/joystick.png";
import { Minesweeper } from "./Minesweeper";

type MinesweeperState = number;

interface MinesweeperWindowProps {
    process: Process<MinesweeperState>;
}
function MinesweeperWindow({ process }: MinesweeperWindowProps) {
    return <Minesweeper></Minesweeper>;
}

export const minesweeperDescription: ProcessDescription<MinesweeperState> = {
    initialState: 0,
    name: "minesweeper.exe",
    onOpen: (process) => {
        openWindowForProcess(process, {
            contentComponent: MinesweeperWindow,
            iconUrl,
            initialTitle: "Minesweeper",
        }, undefined, { width: 300, height: 305});
    },
};
