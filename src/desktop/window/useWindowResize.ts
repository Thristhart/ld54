import { Signal } from "@preact/signals";
import { RefObject } from "preact";
import { useState, useEffect } from "preact/hooks";

enum Cursor {
    Top = "n-resize",
    TopRight = "ne-resize",
    Right = "e-resize",
    BottomRight = "se-resize",
    Bottom = "s-resize",
    BottomLeft = "sw-resize",
    Left = "w-resize",
    TopLeft = "nw-resize",
    Auto = "auto",
}
interface UseWindowResizeOptions {
    position: Signal<{ x: number; y: number }>;
    size: Signal<{ width: number; height: number }>;
    resizeThresholds?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    minWidth?: number;
    minHeight?: number;
    onInteract?: () => void;
}
export function useWindowResize(
    ref: RefObject<HTMLElement>,
    dragTargetRef: RefObject<HTMLElement>,
    {
        position,
        size,
        resizeThresholds = { top: 4, right: 4, bottom: 4, left: 4 },
        minWidth = 100,
        minHeight = 100,
        onInteract,
    }: UseWindowResizeOptions
) {
    useEffect(() => {
        const target = ref.current!;
        if (!target) {
            return;
        }

        let cursor = Cursor.Auto;
        let lockCursor = false;
        function setCursor(newCursor: Cursor) {
            if (lockCursor) {
                return;
            }
            cursor = newCursor;
            document.body.style.cursor = newCursor;
        }

        // we make a mutable copy so that we don't have to redo the whole effect to update it
        const positionBeforeDrag = { ...position.value };
        const sizeBeforeDrag = { ...size.value };

        let mouseDownPageX = 0;
        let mouseDownPageY = 0;
        function onMouseDown(e: MouseEvent) {
            mouseDownPageX = e.pageX;
            mouseDownPageY = e.pageY;

            if (cursor !== Cursor.Auto || e.target === dragTargetRef.current) {
                return startDrag(e);
            }
        }
        function onMouseUp(e: MouseEvent) {}
        function onMouseMove(e: MouseEvent) {
            const { offsetX, offsetY } = e;
            const { width, height } = target.getBoundingClientRect();
            if (offsetX < resizeThresholds.left && offsetY < resizeThresholds.top) {
                setCursor(Cursor.TopLeft);
            } else if (offsetX < resizeThresholds.left && offsetY > height - resizeThresholds.bottom) {
                setCursor(Cursor.BottomLeft);
            } else if (offsetX < resizeThresholds.left) {
                setCursor(Cursor.Left);
            } else if (offsetX > width - resizeThresholds.right && offsetY < resizeThresholds.top) {
                setCursor(Cursor.TopRight);
            } else if (offsetX > width - resizeThresholds.right && offsetY > height - resizeThresholds.bottom) {
                setCursor(Cursor.BottomRight);
            } else if (offsetX > width - resizeThresholds.right) {
                setCursor(Cursor.Right);
            } else if (offsetY < resizeThresholds.top) {
                setCursor(Cursor.Top);
            } else if (offsetY > height - resizeThresholds.bottom) {
                setCursor(Cursor.Bottom);
            } else if (cursor !== Cursor.Auto) {
                setCursor(Cursor.Auto);
            }
        }
        function onMouseLeave(e: MouseEvent) {
            if (cursor !== Cursor.Auto) {
                setCursor(Cursor.Auto);
            }
        }

        function startDrag(e: MouseEvent) {
            lockCursor = true;
            window.addEventListener("mousemove", onDragMove);
            window.addEventListener("mouseup", endDrag);
            onInteract?.();
        }

        function applyDrag(e: MouseEvent) {
            const { pageX, pageY } = e;

            const dx = pageX - mouseDownPageX;
            const dy = pageY - mouseDownPageY;
            let x = positionBeforeDrag.x;
            let y = positionBeforeDrag.y;
            let width = sizeBeforeDrag.width;
            let height = sizeBeforeDrag.height;

            if (cursor === Cursor.Auto) {
                x += dx;
                y += dy;
            } else if (cursor == Cursor.Top) {
                y += dy;
                height -= dy;
                if (height < minHeight) {
                    y -= minHeight - height;
                    height = minHeight;
                }
            } else if (cursor == Cursor.Bottom) {
                height += dy;
                if (height < minHeight) {
                    height = minHeight;
                }
            } else if (cursor === Cursor.Left) {
                x += dx;
                width -= dx;
                if (width < minWidth) {
                    x -= minWidth - width;
                    width = minWidth;
                }
            } else if (cursor === Cursor.BottomLeft) {
                x += dx;
                width -= dx;
                height += dy;
                if (width < minWidth) {
                    x -= minWidth - width;
                    width = minWidth;
                }
                if (height < minHeight) {
                    height = minHeight;
                }
            } else if (cursor === Cursor.TopLeft) {
                x += dx;
                y += dy;
                width -= dx;
                height -= dy;
                if (width < minWidth) {
                    x -= minWidth - width;
                    width = minWidth;
                }
                if (height < minHeight) {
                    y -= minHeight - height;
                    height = minHeight;
                }
            } else if (cursor === Cursor.Right) {
                width += dx;
                if (width < minWidth) {
                    width = minWidth;
                }
            } else if (cursor === Cursor.TopRight) {
                y += dy;
                width += dx;
                height -= dy;
                if (width < minWidth) {
                    width = minWidth;
                }
                if (height < minHeight) {
                    y -= minHeight - height;
                    height = minHeight;
                }
            } else if (cursor === Cursor.BottomRight) {
                width += dx;
                height += dy;
                if (width < minWidth) {
                    width = minWidth;
                }
                if (height < minHeight) {
                    height = minHeight;
                }
            }

            return { x, y, width, height };
        }
        function onDragMove(e: MouseEvent) {
            const { x, y, width, height } = applyDrag(e);
            position.value = { x, y };
            size.value = { width, height };
        }
        function endDrag(e: MouseEvent) {
            window.removeEventListener("mousemove", onDragMove);
            window.removeEventListener("mouseup", endDrag);
            lockCursor = false;

            const { x, y, width, height } = applyDrag(e);

            positionBeforeDrag.x = x;
            positionBeforeDrag.y = y;
            sizeBeforeDrag.width = width;
            sizeBeforeDrag.height = height;

            setCursor(Cursor.Auto);
            onInteract?.();
        }
        target.addEventListener("mousedown", onMouseDown);
        target.addEventListener("mouseup", onMouseUp);
        target.addEventListener("mousemove", onMouseMove);
        target.addEventListener("mouseleave", onMouseLeave);
        return () => {
            target.removeEventListener("mousedown", onMouseDown);
            target.removeEventListener("mouseup", onMouseUp);
            target.removeEventListener("mousemove", onMouseMove);
            target.removeEventListener("mouseleave", onMouseLeave);

            // global listeners
            window.removeEventListener("mousemove", onDragMove);
            window.removeEventListener("mouseup", endDrag);
        };
    }, [resizeThresholds.left, resizeThresholds.top, resizeThresholds.bottom, resizeThresholds.right]);

    return size;
}
