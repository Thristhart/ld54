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
    useWindowResize(containerRef, titleBarRef, {
        onInteract() {
            window.lastInteractionTime.value = performance.now();
        },
        position: window.position,
        size: window.size,
    });
    return (
        <div
            class="window"
            style={{
                width: window.size.value.width,
                height: window.size.value.height,
                transform: `translate(${window.position.value.x}px, ${window.position.value.y}px)`,
            }}
            ref={containerRef}>
            <TitleBar titleBarRef={titleBarRef} />
            <div class="windowContent">
                <window.contentComponent process={window.process} />
            </div>
        </div>
    );
}
