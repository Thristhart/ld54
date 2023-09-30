import { JSXInternal } from "preact/src/jsx";
import startUrl from "~/images/start.png";
import "./taskbar.css";

interface TaskbarProps extends JSXInternal.HTMLAttributes<HTMLElement> {}
export function Taskbar({ ...footerProps }: TaskbarProps) {
    return (
        <footer class="taskbar" {...footerProps}>
            <button class="startButton">
                <img src={startUrl} />
            </button>
        </footer>
    );
}
