import { ProcessDescription } from "~/os/processes";
import { focusWindow, openWindowForProcess, windows, WindowState } from "~/os/windows";
import type { Process } from "~/application/process";
import "./cassie.css";
import iconUrl from "~/images/icons/favicons/joystick.png";
import { RefObject, useEffect } from "react";
import { taskbarHeight } from "~/desktop/taskbar/taskbar";
import { useSignal } from "@preact/signals";

function useAnimationFrame(callback: (dt: number) => void) {
    return useEffect(() => {
        let lastTimestamp = performance.now();
        function tick(timestamp: number) {
            const dt = timestamp - lastTimestamp;
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

const fallspeed = 0.3;

const cassieWidth = 100;
const cassieHeight = 100;

function CassieWindow({ window, dragTargetRef }: CassieWindowProps) {
    const windowAttach = useSignal<WindowState<any> | undefined>(undefined);
    useAnimationFrame((dt) => {
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
    });
    return <div class={"cassie"} ref={dragTargetRef as RefObject<HTMLDivElement>} />;
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
