import { JSXInternal } from "preact/src/jsx";
import startUrl from "~/images/start.png";
import { focusWindow, unminimizeWindow, windows, WindowState } from "~/os/windows";
import "./taskbar.css";
import classnames from "classnames";

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
    return (
        <footer class="taskbar" {...footerProps}>
            <button class="startButton">
                <img src={startUrl} />
            </button>
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
