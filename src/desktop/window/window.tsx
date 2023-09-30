import { useWindowResize } from "./useWindowResize";
import "./window.css";
import { useRef, useCallback } from "preact/hooks";
import { RefObject } from "preact";
import {
    closeWindowForProcess,
    focusWindow,
    maximizeWindow,
    minimizeWindow,
    restoreWindow,
    WindowState,
} from "~/os/windows";
import classNames from "classnames";
import { useDoubleClick } from "../useDoubleClick";

interface TitleBarProps<State> {
    readonly window: WindowState<State>;
    readonly titleBarRef?: RefObject<HTMLDivElement>;
}
function TitleBar<State>({ titleBarRef, window }: TitleBarProps<State>) {
    const onDoubleClick = useCallback(() => {
        if (window.isMaximized.value) {
            restoreWindow(window.windowId);
        } else {
            maximizeWindow(window.windowId);
        }
    }, [window.windowId]);
    const onClick = useDoubleClick(onDoubleClick);
    return (
        <>
            <div class="titleBarBackground" />
            <header class="titleBar" ref={titleBarRef} onClick={onClick}>
                {window.iconUrl && <img class="windowIcon" src={window.iconUrl} />}
                <span class="windowTitle">{window.title.value}</span>
                <div class="windowButtons">
                    <button onClick={() => minimizeWindow(window.windowId)}>-</button>
                    {!window.disableResize &&
                        (window.isMaximized.value ? (
                            <button onClick={() => restoreWindow(window.windowId)}>🗗</button>
                        ) : (
                            <button onClick={() => maximizeWindow(window.windowId)}>🗖</button>
                        ))}
                    <button onClick={() => closeWindowForProcess(window.process, window.windowId)}>X</button>
                </div>
            </header>
        </>
    );
}

interface WindowProps<State> {
    readonly window: WindowState<State>;
}

export function Window<State>({ window }: WindowProps<State>) {
    const containerRef = useRef(null);
    const titleBarRef = useRef(null);
    useWindowResize(containerRef, titleBarRef, {
        onInteract() {
            focusWindow(window.windowId);
        },
        position: window.position,
        size: window.size,
        minWidth: window.minWidth,
        minHeight: window.minHeight,
        disableResize: window.disableResize,
    });
    return (
        <div
            class={classNames("window", window.isMinimized.value && "windowMinimized")}
            style={{
                width: window.size.value.width,
                height: window.size.value.height,
                transform: `translate(${window.position.value.x}px, ${window.position.value.y}px)`,
            }}
            ref={containerRef}
            onClick={() => {
                focusWindow(window.windowId);
            }}>
            <TitleBar titleBarRef={titleBarRef} window={window} />
            <div class="windowContent">
                <window.contentComponent process={window.process} window={window} />
            </div>
        </div>
    );
}
