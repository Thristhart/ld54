import startUrl from "~/images/start.png";
import "./taskbar.css";

export function Taskbar() {
    return (
        <footer>
            <button class="startButton">
                <img src={startUrl} />
            </button>
        </footer>
    );
}
