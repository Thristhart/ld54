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
import { Signal, signal, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { File, files } from "~/os/filesystem";

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
                <button class="steamButton" disabled>
                    Friends
                </button>
                <span class="steamButtonLabel">Find friends, chat, play together</span>
                <button class="steamButton" disabled>
                    Servers
                </button>
                <span class="steamButtonLabel">Browse multiplayer games-in-progress</span>
                <button class="steamButton" disabled>
                    Monitor
                </button>
                <span class="steamButtonLabel">Monitor Steam network activity</span>
                <button class="steamButton" disabled>
                    Settings
                </button>
                <span class="steamButtonLabel">Change Steam options</span>
                <button class="steamButton" disabled>
                    News
                </button>
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

interface SteamInstallWizardStepProps extends SteamWindowProps {
    step: Signal<number>;
}

function SteamInstallWizardIntroPage({ window, step }: SteamInstallWizardStepProps) {
    const game = window.windowParams as SteamGame;
    return (
        <>
            <div class="steamInstallIntro steamInstallStep">
                <p class="aboutToInstall">You're about to install {game.displayName}.</p>
                <div class="steamInstallDetails">
                    <label class="steamInstallDetail">Disk space required:</label>
                    <span class="steamFilesize">180 MB</span>
                    <label class="steamInstallDetail">Disk space available:</label>
                    <span class="steamFilesize">38196 MB</span>
                </div>
                <p class="allFilesDownloaded">All files for this game will now be downloaded through Steam.</p>
            </div>
            <div class="wizardButtons">
                <div>
                    <button class="steamButton" disabled>
                        &lt; Back
                    </button>
                    <button class="steamButton" onClick={() => step.value++}>
                        Next &gt;
                    </button>
                </div>
                <button
                    class="steamButton cancelButton"
                    onClick={() => closeWindowForProcess(window.process, window.windowId)}>
                    Cancel
                </button>
            </div>
        </>
    );
}

// maybe make this depend on game filesize
const installDuration = 10000;

function SteamInstallWizardInstallProgress({ window, step }: SteamInstallWizardStepProps) {
    const game = window.windowParams as SteamGame;
    const isInstalled = window.process.state.value.installedGames.includes(game);
    const installProgress = useSignal(isInstalled ? 1 : 0);

    // shrug emoji
    const barsThatFit = 31;

    useEffect(() => {
        if (isInstalled) {
            return;
        }

        let accumulatedTime = 0;
        let lastTick = performance.now();
        let installSpeed = 1;
        function tick(timestamp: number) {
            const dt = timestamp - lastTick;
            lastTick = timestamp;

            if (Math.random() < 0.5) {
                installSpeed = Math.random();
                if (installSpeed > 0.5) {
                    installSpeed *= 2;
                }
            }
            accumulatedTime += dt * installSpeed;
            let progress = accumulatedTime / installDuration;
            if (progress >= 1) {
                progress = 1;
                installGame(window.process, game);
            } else {
                animFrameHandle = requestAnimationFrame(tick);
            }
            installProgress.value = progress;
        }

        let animFrameHandle = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(animFrameHandle);
        };
    }, [isInstalled]);

    return (
        <>
            <div class="steamInstallIntro steamInstallStep">
                <span class="steamInstallingLabel">
                    {isInstalled ? `${game.displayName} installed.` : `Installing ${game.displayName}...`}
                </span>
                <div class="steamInstallProgress">
                    {Array.from({ length: Math.round(installProgress.value * barsThatFit) }, (_, index) => (
                        <div class="steamInstallBlock" key={index} />
                    ))}
                </div>
            </div>
            <div class="wizardButtons">
                <button
                    class="steamButton cancelButton"
                    onClick={() => closeWindowForProcess(window.process, window.windowId)}>
                    {isInstalled ? "Finish" : "Cancel"}
                </button>
            </div>
        </>
    );
}

const stepComponents = [SteamInstallWizardIntroPage, SteamInstallWizardInstallProgress];

function SteamInstallWindow({ window }: SteamWindowProps) {
    const step = useSignal(0);
    const StepComponent = stepComponents[step.value];
    return (
        <div class="steamWindowContent steamInstallWindow">
            <StepComponent window={window} step={step} />
        </div>
    );
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

function installGame(process: Process<SteamProcessState>, game: SteamGame) {
    process.state.value = {
        installedGames: [...process.state.value.installedGames, game],
        uninstalledGames: process.state.value.uninstalledGames.filter((uninstalled) => uninstalled !== game),
    };

    const filesCopy = [...files.value];
    for (const newFile of game.files) {
        const existingFile = filesCopy.find((file) => file.value.filename === newFile.filename);
        if (existingFile) {
            existingFile.value = newFile;
        } else {
            filesCopy.push(signal(newFile));
        }
    }
    files.value = filesCopy;
}

interface SteamProcessState {
    installedGames: SteamGame[];
    uninstalledGames: SteamGame[];
}

interface SteamGame {
    readonly displayName: string;
    readonly iconUrl: string;
    readonly files: File[];
}

export const steamAppDescription: ProcessDescription<SteamProcessState> = {
    initialState: {
        installedGames: [],
        uninstalledGames: [
            {
                displayName: "Counter-Strike",
                iconUrl,
                files: [
                    {
                        filename: "C:/Steam/steamapps/common/cstrike/cs_office.wad",
                        filesize: 30,
                    },
                    {
                        filename: "C:/Steam/steamapps/common/cstrike/de_vertigo.wad",
                        filesize: 30,
                    },
                ],
            },
            {
                displayName: "Half-Life",
                iconUrl,
                files: [],
            },
            {
                displayName: "Day of Defeat",
                iconUrl,
                files: [],
            },
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
