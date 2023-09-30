import { useWindowResize } from "./useWindowResize";
import "./window.css";
import { useRef } from "preact/hooks";
import { RefObject } from "preact";

interface TitleBarProps {
    readonly titleBarRef?: RefObject<HTMLElement>;
}
function TitleBar({ titleBarRef }: TitleBarProps) {
    return (
        <header class="titleBar" ref={titleBarRef}>
            <div class="titleBarBackground" />
        </header>
    );
}

export function Window() {
    const containerRef = useRef(null);
    const titleBarRef = useRef(null);
    const [position, size] = useWindowResize(containerRef, titleBarRef, {});
    return (
        <div
            class="window"
            style={{ width: size.width, height: size.height, transform: `translate(${position.x}px, ${position.y}px)` }}
            ref={containerRef}>
            <TitleBar titleBarRef={titleBarRef} />
        </div>
    );
}
