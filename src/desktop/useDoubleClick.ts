import { useCallback, useRef } from "preact/hooks";

export function useDoubleClick(onDoubleClick: () => void) {
    const recentClicks = useRef(0);
    return useCallback(() => {
        recentClicks.current++;
        if (recentClicks.current === 2) {
            onDoubleClick();
        }
        setTimeout(() => recentClicks.current--, 250);
    }, [onDoubleClick]);
}
