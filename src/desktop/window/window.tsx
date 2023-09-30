import { useWindowResize } from "./useWindowResize";
import "./window.css";
import { useRef } from "preact/hooks";
import { RefObject } from "preact";
import { WindowState } from "~/os/windows";

interface TitleBarProps<State> {
    readonly window: WindowState<State>;
    readonly titleBarRef?: RefObject<HTMLDivElement>;
}
function TitleBar<State>({ titleBarRef, window }: TitleBarProps<State>) {
    return (
        <>
            <div class="titleBarBackground" />
            <header class="titleBar" ref={titleBarRef}>
                {window.iconUrl && <img class="windowIcon" src={window.iconUrl} />}
                <span class="windowTitle">{window.title.value}</span>
                <div class="windowButtons">
                    <button>X</button>
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
            <TitleBar titleBarRef={titleBarRef} window={window} />
            <div class="windowContent">
                <window.contentComponent process={window.process} />
            </div>
        </div>
    );
}
