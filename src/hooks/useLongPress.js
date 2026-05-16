import { useRef, useCallback } from 'react';

/**
 * Cross-platform long press / context menu hook.
 * - Desktop: right-click fires onContextMenu
 * - Android: 500ms hold fires onContextMenu
 * - Prevents default context menu and text selection during hold
 */
export function useLongPress(callback, ms = 500) {
    const timerRef = useRef(null);
    const fired = useRef(false);

    const start = useCallback((e) => {
        fired.current = false;
        timerRef.current = setTimeout(() => {
            fired.current = true;
            callback(e);
        }, ms);
    }, [callback, ms]);

    const cancel = useCallback(() => {
        clearTimeout(timerRef.current);
    }, []);

    const onContextMenu = useCallback((e) => {
        e.preventDefault();
        if (!fired.current) {
            callback(e);
            fired.current = true;
        }
    }, [callback]);

    return {
        onTouchStart: start,
        onTouchEnd: cancel,
        onTouchMove: cancel,
        onContextMenu,
    };
}
