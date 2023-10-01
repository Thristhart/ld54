import { ProcessDescription } from "~/os/processes";
import { WindowState, focusWindow, openWindowForProcess } from "~/os/windows";
import taskbarIconUrl from "~/images/icons/favicons/steam.png";
import iconUrl from "~/images/icons/steam_small.png";
import valveLogoUrl from "~/images/valvelogo.png";
import "./steam.css";
import { Process } from "../process";

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
                <button class="steamButton">Close</button>
            </footer>
        </div>
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
                    <li key={game.displayName} class="steamGamesListGame installed">
                        <img src={game.iconUrl} />
                        {game.displayName}
                    </li>
                ))}
                {window.process.state.value.uninstalledGames.map((game) => (
                    <li key={game.displayName} class="steamGamesListGame">
                        <img src={game.iconUrl} />
                        {game.displayName}
                    </li>
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
        if (windows.length > 0) {
            focusWindow(windows[0].windowId);
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
