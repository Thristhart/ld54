import { useWindowResize } from "./useWindowResize";
import "./window.css";
import { useRef } from "preact/hooks";
import { RefObject } from "preact";
import { WindowState } from "~/os/windows";

interface TitleBarProps {
    readonly titleBarRef?: RefObject<HTMLDivElement>;
}
function TitleBar({ titleBarRef }: TitleBarProps) {
    return (
        <header class="titleBar">
            <div class="titleBarBackground" ref={titleBarRef} />
        </header>
    );
}

interface WindowProps<State> {
    window: WindowState<State>;
}

export function Window<State>({ window }: WindowProps<State>) {
    const containerRef = useRef(null);
    const titleBarRef = useRef(null);
    const [position, size] = useWindowResize(containerRef, titleBarRef, {
        initialPosition: window.initialPosition,
        onInteract() {
            window.lastInteractionTime.value = performance.now();
        },
    });
    return (
        <div
            class="window"
            style={{ width: size.width, height: size.height, transform: `translate(${position.x}px, ${position.y}px)` }}
            ref={containerRef}>
            <TitleBar titleBarRef={titleBarRef} />
            <div class="windowContent">
                <window.contentComponent process={window.process} />
            </div>
        </div>
    );
}
