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
import { File, files, totalSize } from "~/os/filesystem";
import { displayFilesize } from "~/desktop/fileicon/fileicon";
import { calculateCumulativeFileSize } from "../helpers";
import { eventEmitter } from "~/events";

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
    const spaceAvailable = totalSize - calculateCumulativeFileSize(files.value);
    const spaceRequired = calculateCumulativeFileSize([...game.files, ...game.optionalFiles]);
    const canAdvance = () => {
        return step.value !== 0 || spaceAvailable > spaceRequired;
    };

    return (
        <>
            <div class="steamInstallIntro steamInstallStep">
                <p class="aboutToInstall">You're about to install {game.displayName}.</p>
                <div class="steamInstallDetails">
                    <label class="steamInstallDetail">Disk space required:</label>
                    <span class="steamFilesize">{displayFilesize(spaceRequired)}</span>
                    <label class="steamInstallDetail">Disk space available:</label>
                    <span class="steamFilesize">{displayFilesize(spaceAvailable)}</span>
                </div>
                <p class="allFilesDownloaded">All files for this game will now be downloaded through Steam.</p>
            </div>
            <div class="wizardButtons">
                <div>
                    <button class="steamButton" disabled>
                        &lt; Back
                    </button>
                    <button class="steamButton" disabled={!canAdvance()} onClick={() => step.value++}>
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

function SteamInstallWizardInstallProgress({ window, step }: SteamInstallWizardStepProps) {
    const game = window.windowParams as SteamGame;
    const installDuration = 100 * calculateCumulativeFileSize([...game.files, ...game.optionalFiles]);
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
    const gameFiles = [...game.files, ...game.optionalFiles];
    for (const newFile of gameFiles) {
        const existingFile = filesCopy.find((file) => file.filename === newFile.filename);
        if (!existingFile) {
            filesCopy.push(newFile);
        }
    }
    if (game.displayName === "Counter-Strike") {
        eventEmitter.emit("csInstalled");
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
    readonly optionalFiles: File[];
}

export const Games: { [key: string]: SteamGame } = {
    counterStrike: {
        displayName: "Counter-Strike",
        iconUrl,
        files: [
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/hl.exe",
                filesize: 30,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/vgui.dll",
                filesize: 20,
            },
        ],
        optionalFiles: [
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/ajawad.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/cached.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/chateau.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/cstraining.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/cstrike.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/cs_747.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/cs_assault.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/cs_bdog.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/cs_cbble.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/cs_dust.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/cs_havana.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/cs_office.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/decals.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/de_airstrip.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/de_aztec.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/de_piranesi.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/de_storm.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/de_vertigo.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/itsitaly.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/n0th1ng.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/prodigy.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/torntextures.wad",
                filesize: 3,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/cstrike/tswad.wad",
                filesize: 3,
            },
        ],
    },
    halfLife: {
        displayName: "Half-Life",
        iconUrl,
        files: [
            {
                filename: "C:/Program Files/Steam/steamapps/common/half-life/hl.exe",
                filesize: 30,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/half-life/vgui.dll",
                filesize: 20,
            },
        ],
        optionalFiles: [],
    },
    dayOfDefeat: {
        displayName: "Day of Defeat",
        iconUrl,
        files: [
            {
                filename: "C:/Program Files/Steam/steamapps/common/dod/hl.exe",
                filesize: 30,
            },
            {
                filename: "C:/Program Files/Steam/steamapps/common/dod/vgui.dll",
                filesize: 20,
            },
        ],
        optionalFiles: [],
    },
};

export const steamAppDescription: ProcessDescription<SteamProcessState> = {
    initialState: {
        installedGames: [],
        uninstalledGames: [Games.counterStrike, Games.halfLife, Games.dayOfDefeat],
    },
    name: "steam.exe",
    onOpen: (process) => {
        const windows = Object.values(process.windows);
        const mainWindow = windows.find((window) => window.title.value.startsWith("Steam"));
        if (mainWindow) {
            focusWindow(mainWindow.windowId);
        } else {
            eventEmitter.emit("openSteam");
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
