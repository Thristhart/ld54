import { MutableRef, useCallback, useRef } from "preact/hooks";


export function useDoubleClick(onDoubleClick: () => void) {
    const timeouts = useRef<Array<number>>([]);
    const recentClicks = useRef(0);
    return useCallback(() => {
        recentClicks.current++;
        if (recentClicks.current > 1) {
            onDoubleClick();
            recentClicks.current = 0;
            clearTimeouts(timeouts);
            return;
        }
        timeouts.current.push(setTimeout(() => recentClicks.current--, 250));
    }, [onDoubleClick]);
}

function clearTimeouts(timeouts: MutableRef<number[]>){
    timeouts.current.forEach(x => clearTimeout(x));
    timeouts.current = [];
}
