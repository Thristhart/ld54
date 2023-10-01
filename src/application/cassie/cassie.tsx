import { ProcessDescription } from "~/os/processes";
import { focusWindow, openWindowForProcess, windows, WindowState } from "~/os/windows";
import type { Process } from "~/application/process";
import "./cassie.css";
import iconUrl from "~/images/icons/favicons/joystick.png";
import { RefObject, useCallback, useEffect } from "react";
import { taskbarHeight } from "~/desktop/taskbar/taskbar";
import { signal, useSignal } from "@preact/signals";

function useAnimationFrame(callback: (dt: number) => void) {
    return useEffect(() => {
        let lastTimestamp = performance.now();
        function tick(timestamp: number) {
            const dt = timestamp - lastTimestamp;
            lastTimestamp = timestamp;
            callback(dt);
            frameHandle = requestAnimationFrame(tick);
        }
        let frameHandle = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(frameHandle);
        };
    }, [callback]);
}

type CassieState = number;

interface CassieWindowProps {
    window: WindowState<CassieState>;
    dragTargetRef: RefObject<HTMLElement>;
}

const fallspeed = 0.5;

const cassieWidth = 100;
const cassieHeight = 100;

interface CassieDialog {
    text: string;
    onDismiss?: () => void;
}
export const cassieDialogQueue = signal<CassieDialog[]>([
    { text: "My name is Cassie, your Personal Engagement Tool for navigating LANPlanner!" },
    { text: "Looks like you've got a todo list. Kinda underwhelming if you ask me, where's the personality?" },
    {
        text: "No need to worry, because I'm here now and I'll be sure to keep you on task and notified, with a little magical flair!",
        onDismiss() {
            console.log("boop");
        },
    },
]);

export function AddCassieDialog(dialog: CassieDialog) {
    cassieDialogQueue.value = [...cassieDialogQueue.value, dialog];
}

function CassieWindow({ window, dragTargetRef }: CassieWindowProps) {
    const windowAttach = useSignal<WindowState<any> | undefined>(undefined);
    const animationFrame = useCallback((dt: number) => {
        const pos = window.position.value;
        let dy = dt * fallspeed;
        if (dragTargetRef.current?.dataset.isDragging === "true") {
            dy = 0;
        }

        let floor = innerHeight - taskbarHeight;
        let standingWindow: WindowState<unknown> | undefined;

        Object.values(windows.value).forEach((maybeCollidingWindow) => {
            if (maybeCollidingWindow === window) {
                return;
            }
            const cassieLeft = pos.x + cassieWidth * 0.2;
            const cassieRight = pos.x + cassieWidth - cassieWidth * 0.35;

            const windowLeft = maybeCollidingWindow.position.value.x;
            const windowRight = maybeCollidingWindow.position.value.x + maybeCollidingWindow.size.value.width;

            if (cassieLeft < windowRight && cassieRight > windowLeft) {
                let windowTop = maybeCollidingWindow.position.value.y;
                if (windowTop + cassieHeight / 10 >= pos.y + cassieHeight && windowTop < floor) {
                    floor = windowTop;
                    if (
                        pos.y + cassieHeight <= floor + cassieHeight / 10 &&
                        pos.y + cassieHeight >= floor - cassieHeight / 10
                    ) {
                        standingWindow = maybeCollidingWindow;
                    }
                }
            }
        });

        if (standingWindow) {
            if (windowAttach.value !== standingWindow) {
                if (windowAttach.value?.attachedWindow.value?.window === window) {
                    windowAttach.value.attachedWindow.value = undefined;
                }
                windowAttach.value = standingWindow;
                standingWindow.attachedWindow.value = {
                    offset: {
                        x: pos.x - standingWindow.position.value.x,
                        y: -cassieHeight,
                    },
                    window,
                };
            }
        } else {
            if (windowAttach.value?.attachedWindow.value?.window === window) {
                windowAttach.value.attachedWindow.value = undefined;
            }
            windowAttach.value = undefined;
        }

        if (pos.y + cassieHeight + dy > floor) {
            dy = floor - (pos.y + cassieHeight);
        }

        window.position.value = {
            ...pos,
            y: pos.y + dy,
        };
    }, []);

    useAnimationFrame(animationFrame);

    const nextDialog = cassieDialogQueue.value[0];
    return (
        <>
            {nextDialog && (
                <p class="cassieDialog" onClick={() => advanceCassieDialog()}>
                    {nextDialog.text}
                </p>
            )}
            <div class="cassieWrapper">
                <div class={"cassie"} ref={dragTargetRef as RefObject<HTMLDivElement>} />
            </div>
        </>
    );
}

function advanceCassieDialog() {
    const current = cassieDialogQueue.value[0];
    if (!current) {
        return;
    }
    cassieDialogQueue.value = cassieDialogQueue.value.slice(1);
    if (current.onDismiss) {
        current.onDismiss();
    }
}

export const cassieAppDescription: ProcessDescription<CassieState> = {
    initialState: 0,
    name: "cassie.exe",
    onOpen: (process) => {
        const windows = Object.values(process.windows);
        if (windows.length > 0) {
            focusWindow(windows[0].windowId);
        } else {
            openWindowForProcess(
                process,
                {
                    contentComponent: CassieWindow,
                    iconUrl,
                    initialTitle: "Cassie",
                    disableResize: true,
                    disableTitleBar: true,
                    transparent: true,
                },
                undefined,
                {
                    width: cassieWidth,
                    height: cassieHeight,
                }
            );
        }
    },
};
