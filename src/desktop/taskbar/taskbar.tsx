import { JSXInternal } from "preact/src/jsx";
import startUrl from "~/images/start.png";
import { focusWindow, unminimizeWindow, windows, WindowState } from "~/os/windows";
import "./taskbar.css";
import classnames from "classnames";
import { StartMenu } from "./startmenu";
import { useSignal, useSignalEffect } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";

export const taskbarHeight = 34;

interface TaskbarWindowProps {
    window: WindowState<unknown>;
    focused: boolean;
}
function TaskbarWindow({ window, focused }: TaskbarWindowProps) {
    return (
        <button
            class={classnames("taskbarButton", focused && "taskbarFocused")}
            onClick={() => {
                unminimizeWindow(window.windowId);
                focusWindow(window.windowId);
            }}>
            {(window.taskbarIconUrl ?? window.iconUrl) && (
                <img class="taskbarIcon" src={window.taskbarIconUrl ?? window.iconUrl} />
            )}
            <span class="taskbarTitle">{window.title.value}</span>
        </button>
    );
}

interface TaskbarProps extends JSXInternal.HTMLAttributes<HTMLElement> {
    focused: WindowState<unknown>;
}
export function Taskbar({ focused, ...footerProps }: TaskbarProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const showStartMenu = useSignal(false);
    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (!menuRef.current?.contains(e.target as Node)) {
                showStartMenu.value = false;
            }
        }
        if (showStartMenu.value) {
            document.body.addEventListener("click", onClick);
        } else {
            document.body.removeEventListener("click", onClick);
        }
        return () => document.body.removeEventListener("click", onClick);
    }, [showStartMenu.value]);
    return (
        <footer class="taskbar" {...footerProps}>
            <button class="startButton" onClick={() => (showStartMenu.value = !showStartMenu.value)}>
                <img src={startUrl} />
            </button>
            {showStartMenu.value && <StartMenu menuRef={menuRef} />}
            {Object.values(windows.value).map((window) => (
                <TaskbarWindow
                    window={window}
                    key={window.windowId}
                    focused={window === focused && !window.isMinimized.value}
                />
            ))}
        </footer>
    );
}
