import { useState, useEffect, useCallback, useRef } from 'react';

export const useScale = (canvasWidth, canvasHeight) => {
    const [canvasScale, setCanvasScale] = useState(0.4);
    const lastTouchDist = useRef(null);

    const handleResize = useCallback(() => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        // Even larger margins for starting (zoomed out look)
        const marginX = screenWidth < 768 ? 40 : 160;
        const marginY = screenWidth < 768 ? 180 : 160;

        const wScale = (screenWidth - marginX) / canvasWidth;
        const hScale = (screenHeight - marginY) / canvasHeight;

        let newScale = Math.min(wScale, hScale);
        newScale = Math.min(Math.max(newScale, 0.1), 2.0);
        setCanvasScale(newScale);
    }, [canvasWidth, canvasHeight]);

    useEffect(() => {
        handleResize();
    }, [canvasWidth, canvasHeight, handleResize]);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    useEffect(() => {
        const handleWheel = (e) => {
            // Pinch-to-zoom usually triggers wheel with Ctrl key on Windows/Linux
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();

                // Adaptive sensitivity based on delta mode
                // 0 = Pixel (Trackpads), 1 = Line (Mouse Wheel), 2 = Page
                const isTrackpad = Math.abs(e.deltaY) < 50;
                const sensitivity = isTrackpad ? 0.02 : 0.005;

                const delta = e.deltaY;
                const factor = 1 - (delta * sensitivity);

                setCanvasScale(prev => {
                    const newScale = prev * factor;
                    return Math.min(Math.max(newScale, 0.1), 4.0);
                });
            }
        };

        // Safari/Webkit Gesture Events for Pinch
        const handleGestureStart = (e) => {
            e.preventDefault();
        };

        const handleGestureChange = (e) => {
            e.preventDefault();
            const scaleChange = e.scale;
            // Removed heavy damping to make it more responsive
            setCanvasScale(prev => {
                const newScale = prev * (1 + (scaleChange - 1) * 0.8);
                return Math.min(Math.max(newScale, 0.1), 4.0);
            });
        };

        const handleGestureEnd = (e) => {
            e.preventDefault();
        };

        const handleTouchStart = (e) => {
            if (e.touches.length === 2) {
                const dist = Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                );
                lastTouchDist.current = dist;
            }
        };

        const handleTouchMove = (e) => {
            if (e.touches.length === 2 && lastTouchDist.current !== null) {
                e.preventDefault(); // Prevent native page zoom
                const dist = Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                );
                const factor = dist / lastTouchDist.current;

                // Apply the zoom
                setCanvasScale(prev => Math.min(Math.max(prev * factor, 0.1), 4.0));

                lastTouchDist.current = dist;
            }
        };

        const handleTouchEnd = () => {
            lastTouchDist.current = null;
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        // Non-standard gesture events (Safari)
        if ('ongesturestart' in window) {
            window.addEventListener('gesturestart', handleGestureStart, { passive: false });
            window.addEventListener('gesturechange', handleGestureChange, { passive: false });
            window.addEventListener('gestureend', handleGestureEnd, { passive: false });
        }

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);

            if ('ongesturestart' in window) {
                window.removeEventListener('gesturestart', handleGestureStart);
                window.removeEventListener('gesturechange', handleGestureChange);
                window.removeEventListener('gestureend', handleGestureEnd);
            }
        };
    }, []);

    return [canvasScale, setCanvasScale];
};
