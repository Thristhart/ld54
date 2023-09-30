import { signal, Signal, useComputed, useSignal, useSignalEffect } from "@preact/signals";
import classNames from "classnames";
import { MutableRef, useMemo, useRef } from "preact/hooks";
import "./Minesweeper.css";

enum CellState {
    Hidden = "hidden",
    Revealed = "revealed",
    Flagged = "flagged",
    FlaggedMine = "flaggedMine",
    Mine = "mine",
}

type MinesweeperGrid = Array<Array<Signal<CellState>>>;

function generateGrid(): MinesweeperGrid {
    const grid: MinesweeperGrid = [];
    for (let x = 0; x < gridSize; x++) {
        grid[x] = [];
        for (let y = 0; y < gridSize; y++) {
            grid[x][y] = signal(CellState.Hidden);
        }
    }
    return grid;
}
function getSurrounding(x: number, y: number): Array<[number, number]> {
    const surrounding: Array<[number, number]> = [];

    for (const nextY of [y - 1, y, y + 1]) {
        if (nextY < 0) {
            continue;
        }
        if (nextY >= gridSize) {
            continue;
        }

        for (const nextX of [x - 1, x, x + 1]) {
            if (nextX < 0) {
                continue;
            }
            if (nextX >= gridSize) {
                continue;
            }
            if (x === nextX && y === nextY) {
                continue;
            }

            surrounding.push([nextX, nextY]);
        }
    }

    return surrounding;
}
function placeMines(grid: MinesweeperGrid, avoidX: number, avoidY: number, mineCount: number) {
    const flatCellIndexes: number[] = Array.from({ length: gridSize * gridSize }, (_, i) => i);
    // Remove a 3x3 grid around the cell played.
    const indexesToRemove = [avoidY * gridSize + avoidX];

    for (const [nextX, nextY] of getSurrounding(avoidX, avoidY)) {
        indexesToRemove.push(nextY * gridSize + nextX);
    }
    indexesToRemove.sort((a, b) => a - b);

    for (const [removed, indexToRemove] of indexesToRemove.entries()) {
        flatCellIndexes.splice(indexToRemove - removed, 1);
    }
    let minesToPlace = mineCount;
    while (minesToPlace) {
        const index = flatCellIndexes.splice(Math.floor(Math.random() * flatCellIndexes.length), 1)[0];

        const x = index % gridSize;
        const y = (index - x) / gridSize;

        grid[x][y].value = CellState.Mine;
        minesToPlace -= 1;
    }
}
function countAdjacentMines(grid: MinesweeperGrid, x: number, y: number): number {
    let count = 0;
    for (const [nextX, nextY] of getSurrounding(x, y)) {
        if (grid[nextX][nextY].value === CellState.Mine || grid[nextX][nextY].value === CellState.FlaggedMine) {
            count += 1;
        }
    }
    return count;
}
function reveal(grid: MinesweeperGrid, gameState: Signal<GameState>, x: number, y: number) {
    // The set contains the cell position as if it were a single flat array.
    const revealSet = new Set<number>([x + y * gridSize]);

    for (const value of revealSet) {
        const x = value % gridSize;
        const y = (value - x) / gridSize;

        const cell = grid[x][y];

        if (cell.value === CellState.Revealed) {
            throw Error("Cell already revealed");
        }
        if (cell.value === CellState.Mine) {
            gameState.value = GameState.Lost;
            break;
        }

        cell.value = CellState.Revealed;

        if (countAdjacentMines(grid, x, y) > 0) {
            continue;
        }

        for (const [nextX, nextY] of getSurrounding(x, y)) {
            const nextCell = grid[nextX][nextY];
            if (
                nextCell.value !== CellState.Revealed &&
                nextCell.value !== CellState.Flagged &&
                nextCell.value !== CellState.FlaggedMine
            ) {
                revealSet.add(nextX + nextY * gridSize);
            }
        }
    }
}

interface CellProps {
    readonly x: number;
    readonly y: number;
    readonly grid: MinesweeperGrid;
    readonly gameState: Signal<GameState>;
    readonly mineCount: MutableRef<number>;
}
const Cell = ({ x, y, grid, gameState, mineCount }: CellProps) => {
    const state = grid[x][y];
    let nearby = 0;
    if (state.value === CellState.Revealed) {
        nearby = countAdjacentMines(grid, x, y);
    }
    let visibleState = state.value;
    if (state.value === CellState.Mine && gameState.value !== GameState.Lost) {
        visibleState = CellState.Hidden;
    }
    return (
        <button
            class="minesweeperCell"
            data-state={visibleState}
            style={{ "--nearby": nearby }}
            onContextMenu={(e) => {
                e.preventDefault();
                if (gameState.value !== GameState.Playing) {
                    return;
                }
                if (state.value === CellState.Revealed) {
                    return;
                }
                if (state.value === CellState.Hidden) {
                    state.value = CellState.Flagged;
                } else if (state.value === CellState.Flagged) {
                    state.value = CellState.Hidden;
                }
                if (state.value === CellState.Mine) {
                    state.value = CellState.FlaggedMine;
                } else if (state.value === CellState.FlaggedMine) {
                    state.value = CellState.Mine;
                }
            }}
            onClick={(e) => {
                e.preventDefault();
                if (state.value === CellState.Revealed) {
                    return;
                }
                if (e.button === 0) {
                    if (gameState.value === GameState.Pending) {
                        placeMines(grid, x, y, mineCount.current);
                        gameState.value = GameState.Playing;
                    } else if (gameState.value !== GameState.Playing) {
                        return;
                    }
                    reveal(grid, gameState, x, y);
                }
            }}
        />
    );
};

const gridSize = 8;

interface GridProps {
    readonly grid: MinesweeperGrid;
    readonly gameState: Signal<GameState>;
    readonly mineCount: MutableRef<number>;
}
const Grid = ({ grid, gameState, mineCount }: GridProps) => {
    const cells = [];
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            cells.push(<Cell x={x} y={y} grid={grid} gameState={gameState} mineCount={mineCount} />);
        }
    }
    return (
        <div class="minesweeperGrid" style={{ "--grid-size": gridSize }}>
            {cells}
        </div>
    );
};

interface FaceButtonProps {
    readonly gameState: Signal<GameState>;
}
const FaceButton = ({ gameState }: FaceButtonProps) => {
    return (
        <button
            class="minesweeperFaceButton"
            data-state={gameState.value}
            onClick={() => {
                gameState.value = GameState.Pending;
            }}
        />
    );
};

interface DigitsProps {
    readonly grid: MinesweeperGrid;
    readonly gameState: Signal<GameState>;
    readonly mineCount: MutableRef<number>;
}

const Digits = ({ grid, gameState, mineCount }: DigitsProps) => {
    let remainingMines = 0;
    let flagged = 0;
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (grid[x][y].value === CellState.Mine) {
                remainingMines += 1;
            }
            if (grid[x][y].value === CellState.Flagged) {
                flagged += 1;
            }
        }
    }
    if (gameState.value === GameState.Pending) {
        remainingMines = mineCount.current;
    }
    const numberToDisplay = (remainingMines - flagged).toFixed(0).padStart(3, "0");

    return (
        <span class="mineCount">
            {numberToDisplay.split("").map((digit) => (
                <div class="minesweeperDigit" style={{ "--digit": digit === "-" ? 11 : digit }} />
            ))}
        </span>
    );
};

enum GameState {
    Pending = "pending",
    Playing = "playing",
    Lost = "lost",
    Won = "won",
}

export const Minesweeper = () => {
    const initialGrid = useMemo(generateGrid, []);
    const grid = useSignal(initialGrid);
    const gameState = useSignal(GameState.Pending);
    const mineCount = useRef(9);

    useSignalEffect(() => {
        if (gameState.value === GameState.Lost) {
            for (const row of grid.value) {
                for (const cell of row) {
                    if (cell.value === CellState.FlaggedMine) {
                        cell.value = CellState.Mine;
                    }
                }
            }
        }
        if (gameState.value === GameState.Pending) {
            grid.value = generateGrid();
        }
        if (gameState.value === GameState.Playing) {
            let revealed = 0;
            for (const row of grid.value) {
                for (const cell of row) {
                    if (cell.value === CellState.Revealed) {
                        revealed++;
                    }
                }
            }
            if (revealed >= gridSize * gridSize - mineCount.current) {
                gameState.value = GameState.Won;
            }
        }
    });
    useSignalEffect(() => {
        if (gameState.value === GameState.Won) {
            //TODO: winning.
        }
    });

    useSignalEffect(() => {
        let isMineInCorner = false;
        let corners = [
            [0, 0],
            [0, gridSize - 1],
            [gridSize - 1, 0],
            [gridSize - 1, gridSize - 1],
        ];
        for (const [x, y] of corners) {
            if (grid.value[x][y].value === CellState.Mine || grid.value[x][y].value === CellState.FlaggedMine) {
                isMineInCorner = true;
            }
        }
    });

    return (
        <div class={classNames("minesweeper")}>
            <FaceButton gameState={gameState} />
            <Digits grid={grid.value} gameState={gameState} mineCount={mineCount} />
            <Grid grid={grid.value} gameState={gameState} mineCount={mineCount} />
        </div>
    );
};
