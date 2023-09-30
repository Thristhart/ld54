import { RefObject } from "preact";
import { useState, useEffect } from "preact/hooks";

interface UseWindowResizeOptions {
    initialPosition?: { x: number; y: number };
    initialSize?: { width: number; height: number };
}
export function useWindowResize(
    ref: RefObject<HTMLElement>,
    dragTargetRef: RefObject<HTMLElement>,
    { initialPosition = { x: 0, y: 0 }, initialSize = { width: 200, height: 200 } }: UseWindowResizeOptions
) {
    const [position, setPosition] = useState(initialPosition);
    const [size, setSize] = useState(initialSize);

    useEffect(() => {
        const target = ref.current!;
        if (!target) {
            return;
        }

        // we make a mutable copy so that we don't have to redo the whole effect to update it
        const positionBeforeDrag = { ...position };

        let mouseDownPageX = 0;
        let mouseDownPageY = 0;
        function onMouseDown(e: MouseEvent) {
            mouseDownPageX = e.pageX;
            mouseDownPageY = e.pageY;

            if (e.target === dragTargetRef.current || dragTargetRef.current?.contains(e.target as Node)) {
                return startDrag(e);
            }
        }
        function onMouseUp(e: MouseEvent) {}
        function onMouseMove(e: MouseEvent) {}
        function onMouseEnter(e: MouseEvent) {}
        function onMouseLeave(e: MouseEvent) {}

        function startDrag(e: MouseEvent) {
            target.addEventListener("mousemove", onDragMove);
            target.addEventListener("mouseup", endDrag);
        }
        function onDragMove(e: MouseEvent) {
            const { pageX, pageY } = e;

            const x = pageX - mouseDownPageX + positionBeforeDrag.x;
            const y = pageY - mouseDownPageY + positionBeforeDrag.y;
            setPosition({
                x,
                y,
            });
        }
        function endDrag(e: MouseEvent) {
            target.removeEventListener("mousemove", onDragMove);
            target.removeEventListener("mouseup", endDrag);
            positionBeforeDrag.x += e.pageX - mouseDownPageX;
            positionBeforeDrag.y += e.pageY - mouseDownPageY;
        }
        target.addEventListener("mousedown", onMouseDown);
        target.addEventListener("mouseup", onMouseUp);
        target.addEventListener("mouseenter", onMouseEnter);
        target.addEventListener("mousemove", onMouseMove);
        target.addEventListener("mouseleave", onMouseLeave);
        return () => {
            target.removeEventListener("mousedown", onMouseDown);
            target.removeEventListener("mouseup", onMouseUp);
            target.removeEventListener("mouseenter", onMouseEnter);
            target.removeEventListener("mousemove", onMouseMove);
            target.removeEventListener("mouseleave", onMouseLeave);
        };
    }, []);

    return [position, size] as const;
}
