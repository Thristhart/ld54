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
    readonly titleBarRef?: RefObject<HTMLElement>;
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
                    <button class="minimizeButton" onClick={() => minimizeWindow(window.windowId)}>
                        <span class="buttonIcon">🗕</span>
                    </button>
                    {!window.disableResize &&
                        (window.isMaximized.value ? (
                            <button class="maximizeButton" onClick={() => restoreWindow(window.windowId)}>
                                <span class="buttonIcon">🗗</span>
                            </button>
                        ) : (
                            <button class="maximizeButton" onClick={() => maximizeWindow(window.windowId)}>
                                <span class="buttonIcon"> 🗖</span>
                            </button>
                        ))}
                    <button class="closeButton" onClick={() => closeWindowForProcess(window.process, window.windowId)}>
                        <span class="buttonIcon"> 🞫</span>
                    </button>
                </div>
            </header>
        </>
    );
}

interface WindowProps<State> {
    readonly window: WindowState<State>;
    readonly isFocused: boolean;
}

export function Window<State>({ window, isFocused }: WindowProps<State>) {
    const containerRef = useRef(null);
    const titleBarRef = useRef<HTMLElement>(null);
    useWindowResize(containerRef, titleBarRef, {
        onInteract() {
            focusWindow(window.windowId);
        },
        position: window.position,
        size: window.size,
        minWidth: window.minWidth,
        minHeight: window.minHeight,
        disableResize: window.disableResize,
        attachedWindow: window.attachedWindow?.value,
    });
    return (
        <div
            class={classNames(
                "window",
                isFocused && "windowFocused",
                window.isMinimized.value && "windowMinimized",
                window.disableTitleBar && "windowNoTitlebar",
                window.transparent && "windowTransparent",
                window.disableBorder && "windowNoBorder"
            )}
            data-process={window.process.name}
            style={{
                width: window.size.value.width,
                height: window.size.value.height,
                transform: `translate(${window.position.value.x}px, ${window.position.value.y}px)`,
            }}
            ref={containerRef}
            onClick={() => {
                focusWindow(window.windowId);
            }}>
            {!window.disableTitleBar && <TitleBar titleBarRef={titleBarRef} window={window} />}
            <div class="windowContent">
                <window.contentComponent process={window.process} window={window} dragTargetRef={titleBarRef} />
            </div>
        </div>
    );
}
