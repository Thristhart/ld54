import { ProcessDescription } from "~/os/processes";
import { WindowState, closeWindowForProcess, focusWindow, openWindowForProcess } from "~/os/windows";
import taskbarIconUrl from "~/images/icons/favicons/steam.png";
import iconUrl from "~/images/icons/steam_small.png";
import valveLogoUrl from "~/images/valvelogo.png";
import "./steam.css";
import { Process } from "../process";
import classNames from "classnames";
import { useDoubleClick } from "~/desktop/useDoubleClick";
import { useCallback } from "react";

interface SteamWindowProps {
    window: WindowState<SteamProcessState>;
}

function SteamMainWindow({ window }: SteamWindowProps) {
    return (
        <div class="steamWindowContent steamMainWindow">
            <div class="steamMainWindowButtons">
                <button class="steamButton" onClick={() => openGamesWindow(window.process)}>
                    Games
                </button>
                <span class="steamButtonLabel">Choose a game and start playing!</span>
                <button class="steamButton">Friends</button>
                <span class="steamButtonLabel">Find friends, chat, play together</span>
                <button class="steamButton">Servers</button>
                <span class="steamButtonLabel">Browse multiplayer games-in-progress</span>
                <button class="steamButton">Monitor</button>
                <span class="steamButtonLabel">Monitor Steam network activity</span>
                <button class="steamButton">Settings</button>
                <span class="steamButtonLabel">Change Steam options</span>
                <button class="steamButton">News</button>
                <span class="steamButtonLabel">Keep up with the latest Steam news</span>
            </div>
            <hr />
            <footer class="steamMainWindowFooter">
                <img src={valveLogoUrl} />
                <button class="steamButton" onClick={() => closeWindowForProcess(window.process, window.windowId)}>
                    Close
                </button>
            </footer>
        </div>
    );
}

interface GamesListProps {
    game: SteamGame;
    window: WindowState<SteamProcessState>;
    installed: boolean;
}
function GamesListItem({ game, window, installed }: GamesListProps) {
    const install = useCallback(() => {
        openInstallWindow(window.process, game);
    }, [game, window]);
    const installOnDoubleclick = useDoubleClick(install);

    return (
        <li key={game.displayName} class={classNames("steamGamesListGame", installed && "installed")}>
            <button onClick={!installed ? installOnDoubleclick : undefined}>
                <img src={game.iconUrl} />
                {game.displayName}
            </button>
        </li>
    );
}

function SteamGamesWindow({ window }: SteamWindowProps) {
    return (
        <div class="steamWindowContent steamGamesWindow">
            <header class="steamGamesHeader">
                <span class="steamHighlightText">MY GAMES</span>
                <hr />
            </header>
            <ul class="steamGamesList">
                {window.process.state.value.installedGames.map((game) => (
                    <GamesListItem game={game} window={window} installed={true} />
                ))}
                {window.process.state.value.uninstalledGames.map((game) => (
                    <GamesListItem game={game} window={window} installed={false} />
                ))}
            </ul>
        </div>
    );
}

function openGamesWindow(process: Process<SteamProcessState>) {
    const windows = Object.values(process.windows);
    const gamesWindow = windows.find((window) => window.title.value === "Games");
    if (gamesWindow) {
        focusWindow(gamesWindow.windowId);
    } else {
        openWindowForProcess(
            process,
            {
                contentComponent: SteamGamesWindow,
                iconUrl,
                taskbarIconUrl,
                initialTitle: "Games",
                disableBorder: true,
                disableResize: true,
            },
            undefined,
            { width: 200, height: 300 }
        );
    }
}

function SteamInstallWindow({ window }: SteamWindowProps) {
    const game = window.windowParams as SteamGame;
    return <div>You're about to install {game.displayName}.</div>;
}

function openInstallWindow(process: Process<SteamProcessState>, game: SteamGame) {
    const windows = Object.values(process.windows);
    const installWindow = windows.find((window) => window.title.value.startsWith("Install"));
    if (installWindow) {
        focusWindow(installWindow.windowId);
    } else {
        openWindowForProcess(
            process,
            {
                contentComponent: SteamInstallWindow,
                iconUrl,
                taskbarIconUrl,
                initialTitle: `Install - ${game.displayName}`,
                disableBorder: true,
                disableResize: true,
                windowParams: game,
            },
            undefined,
            { width: 400, height: 400 }
        );
    }
}

interface SteamProcessState {
    installedGames: SteamGame[];
    uninstalledGames: SteamGame[];
}

interface SteamGame {
    readonly displayName: string;
    readonly iconUrl: string;
    // todo: files
}

export const steamAppDescription: ProcessDescription<SteamProcessState> = {
    initialState: {
        installedGames: [{ displayName: "Counter-Strike", iconUrl }],
        uninstalledGames: [
            { displayName: "Half-Life", iconUrl },
            { displayName: "Day of Defeat", iconUrl },
        ],
    },
    name: "steam.exe",
    onOpen: (process) => {
        const windows = Object.values(process.windows);
        const mainWindow = windows.find((window) => window.title.value.startsWith("Steam"));
        if (mainWindow) {
            focusWindow(mainWindow.windowId);
        } else {
            openWindowForProcess(
                process,
                {
                    contentComponent: SteamMainWindow,
                    iconUrl,
                    taskbarIconUrl,
                    initialTitle: "Steam",
                    disableBorder: true,
                    disableResize: true,
                },
                undefined,
                { width: 350, height: 280 }
            );
        }
    },
};
