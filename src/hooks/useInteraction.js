import { useState } from 'react';

export const useInteraction = (elements, canvasScale, updateElement) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
    const [isMarquee, setIsMarquee] = useState(false);
    const [selectionBox, setSelectionBox] = useState(null);
    const [guides, setGuides] = useState({ x: null, y: null, labelX: '', labelY: '', distances: [] });
    const [draggedElementsStart, setDraggedElementsStart] = useState([]);

    const getPoint = (e) => {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    };

    const findGuides = (selectedElement) => {
        const threshold = 5;
        let guideX = null;
        let guideY = null;
        let labelX = "Alignment X";
        let labelY = "Alignment Y";
        let distances = [];

        const selX = selectedElement.x;
        const selY = selectedElement.y;
        const selW = selectedElement.width;
        const selH = selectedElement.height;
        const selCenterX = selX + selW / 2;
        const selCenterY = selY + selH / 2;
        const selRight = selX + selW;
        const selBottom = selY + selH;

        const PAGE_WIDTH = 794;
        const PAGE_HEIGHT = 1123;
        const PAGE_CENTER_X = PAGE_WIDTH / 2;
        const PAGE_CENTER_Y = PAGE_HEIGHT / 2;

        // Page Center Check
        if (Math.abs(selCenterX - PAGE_CENTER_X) < threshold) {
            guideX = PAGE_CENTER_X;
            labelX = "CENTERED (X)";
        }
        if (Math.abs(selCenterY - PAGE_CENTER_Y) < threshold) {
            guideY = PAGE_CENTER_Y;
            labelY = "CENTERED (Y)";
        }

        // --- Page Edge Distances ---
        const EDGE_THRESHOLD = 150;
        // Top edge
        if (selY < EDGE_THRESHOLD && selY > 0) {
            distances.push({ type: 'vertical', value: Math.round(selY), x: selCenterX, y: 0, h: selY, isEdge: true });
        }
        // Bottom edge
        if (PAGE_HEIGHT - selBottom < EDGE_THRESHOLD && PAGE_HEIGHT - selBottom > 0) {
            distances.push({ type: 'vertical', value: Math.round(PAGE_HEIGHT - selBottom), x: selCenterX, y: selBottom, h: PAGE_HEIGHT - selBottom, isEdge: true });
        }
        // Left edge
        if (selX < EDGE_THRESHOLD && selX > 0) {
            distances.push({ type: 'horizontal', value: Math.round(selX), x: 0, y: selCenterY, w: selX, isEdge: true });
        }
        // Right edge
        if (PAGE_WIDTH - selRight < EDGE_THRESHOLD && PAGE_WIDTH - selRight > 0) {
            distances.push({ type: 'horizontal', value: Math.round(PAGE_WIDTH - selRight), x: selRight, y: selCenterY, w: PAGE_WIDTH - selRight, isEdge: true });
        }

        elements.forEach(el => {
            if (el.id === selectedElement.id) return;

            const elX = el.x;
            const elY = el.y;
            const elW = el.width;
            const elH = el.height;
            const elRight = elX + elW;
            const elBottom = elY + elH;
            const elCenterX = elX + elW / 2;
            const elCenterY = elY + elH / 2;

            // X-Alignment and Distances
            if (Math.abs(selX - elX) < threshold) { guideX = elX; labelX = "Align Left"; }
            else if (Math.abs(selRight - elRight) < threshold) { guideX = elRight; labelX = "Align Right"; }
            else if (Math.abs(selCenterX - elCenterX) < threshold) { guideX = elCenterX; labelX = "Align Center"; }

            // Distance Calculation (Horizontal Gap)
            if (selRight < elX || selX > elRight) {
                const dist = selRight < elX ? elX - selRight : selX - elRight;
                if (dist < 100) {
                    distances.push({
                        type: 'horizontal',
                        value: Math.round(dist),
                        x: selRight < elX ? selRight : elRight,
                        y: (selY + selBottom) / 2,
                        w: dist
                    });
                }
            }

            // Y-Alignment and Distances
            if (Math.abs(selY - elY) < threshold) { guideY = elY; labelY = "Align Top"; }
            else if (Math.abs(selBottom - elBottom) < threshold) { guideY = elBottom; labelY = "Align Bottom"; }
            else if (Math.abs(selCenterY - elCenterY) < threshold) { guideY = elCenterY; labelY = "Align Center"; }

            // Distance Calculation (Vertical Gap)
            if (selBottom < elY || selY > elBottom) {
                const dist = selBottom < elY ? elY - selBottom : selY - elBottom;
                if (dist < 100) {
                    distances.push({
                        type: 'vertical',
                        value: Math.round(dist),
                        x: (selX + selRight) / 2,
                        y: selBottom < elY ? selBottom : elBottom,
                        h: dist
                    });
                }
            }
        });

        return { x: guideX, y: guideY, labelX, labelY, distances };
    };

    const handleStart = (e, id, setSelectedIds, setShowMobileProps) => {
        e.stopPropagation();
        const point = getPoint(e);
        const isShift = e.shiftKey;

        if (id) {
            setSelectedIds(prev => {
                const isSelected = prev.includes(id);
                if (isShift) {
                    return isSelected ? prev.filter(p => p !== id) : [...prev, id];
                }
                return isSelected ? prev : [id];
            });

            const el = elements.find(item => item.id === id);
            if (el) {
                setInitialPos({ x: el.x, y: el.y });
            }
            setIsDragging(true);
            setIsMarquee(false);
            setShowMobileProps(true);
        } else {
            // Clicked on empty canvas
            if (!isShift) setSelectedIds([]);
            setIsDragging(true);
            setIsMarquee(true);
        }

        setDragStart(point);
    };

    const handleMove = (e, selectedIds, selectedElements) => {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault();
        const point = getPoint(e);

        if (isMarquee) {
            const canvasEl = e.currentTarget;
            const rect = canvasEl.getBoundingClientRect();
            const dx = (point.x - dragStart.x) / canvasScale;
            const dy = (point.y - dragStart.y) / canvasScale;

            setSelectionBox({
                x: dx > 0 ? (dragStart.x - rect.left) / canvasScale : (point.x - rect.left) / canvasScale,
                y: dy > 0 ? (dragStart.y - rect.top) / canvasScale : (point.y - rect.top) / canvasScale,
                width: Math.abs(dx),
                height: Math.abs(dy)
            });
            return;
        }

        if (selectedIds.length === 0) return;

        const totalDx = (point.x - dragStart.x) / canvasScale;
        const totalDy = (point.y - dragStart.y) / canvasScale;

        if (draggedElementsStart.length === 0) {
            setDraggedElementsStart(selectedElements.map(el => ({ id: el.id, x: el.x, y: el.y })));
            return;
        }

        const primaryEl = selectedElements[0];
        const primaryStart = draggedElementsStart.find(s => s.id === primaryEl.id);
        if (!primaryStart) return;

        let appliedX = primaryStart.x + totalDx;
        let appliedY = primaryStart.y + totalDy;

        const foundGuides = findGuides({ ...primaryEl, x: appliedX, y: appliedY });

        if (foundGuides.x !== null) {
            const selW = primaryEl.width;
            if (foundGuides.labelX.includes("Left")) appliedX = foundGuides.x;
            else if (foundGuides.labelX.includes("Right")) appliedX = foundGuides.x - selW;
            else if (foundGuides.labelX.includes("Center")) appliedX = foundGuides.x - selW / 2;
            else if (foundGuides.labelX.includes("CENTERED")) appliedX = foundGuides.x - selW / 2;
        }

        if (foundGuides.y !== null) {
            const selH = primaryEl.height;
            if (foundGuides.labelY.includes("Top")) appliedY = foundGuides.y;
            else if (foundGuides.labelY.includes("Bottom")) appliedY = foundGuides.y - selH;
            else if (foundGuides.labelY.includes("CENTERED")) appliedY = foundGuides.y - selH / 2;
        }

        if (foundGuides.y !== null && (foundGuides.labelY.includes("Center") || foundGuides.labelY.includes("CENTERED"))) {
            appliedY = foundGuides.y - primaryEl.height / 2;
        }

        const snapDx = appliedX - (primaryStart.x + totalDx);
        const snapDy = appliedY - (primaryStart.y + totalDy);

        selectedElements.forEach(el => {
            const start = draggedElementsStart.find(s => s.id === el.id);
            if (start) {
                updateElement(el.id, {
                    x: start.x + totalDx + snapDx,
                    y: start.y + totalDy + snapDy
                });
            }
        });

        setGuides(foundGuides);
    };

    const handleEnd = (setSelectedIds) => {
        if (isMarquee && selectionBox) {
            const newlySelected = elements.filter(el => {
                return (
                    el.x >= selectionBox.x &&
                    el.x + el.width <= selectionBox.x + selectionBox.width &&
                    el.y >= selectionBox.y &&
                    el.y + el.height <= selectionBox.y + selectionBox.height
                );
            }).map(el => el.id);

            if (newlySelected.length > 0) {
                setSelectedIds(newlySelected);
            } else {
                setSelectedIds([]);
            }
        }

        setIsDragging(false);
        setIsMarquee(false);
        setSelectionBox(null);
        setGuides({ x: null, y: null, labelX: '', labelY: '', distances: [] });
        setDraggedElementsStart([]);
    };

    const handleResizeStart = (e, direction, id) => {
        e.stopPropagation();

        const el = elements.find(e => e.id === id);
        const point = getPoint(e);
        const startX = point.x;
        const startY = point.y;
        const startW = el.width;
        const startH = el.height;
        const startPosX = el.x;
        const startPosY = el.y;

        const onMove = (moveEvent) => {
            if (moveEvent.cancelable) moveEvent.preventDefault();

            const movePoint = getPoint(moveEvent);
            const dx = (movePoint.x - startX) / canvasScale;
            const dy = (movePoint.y - startY) / canvasScale;

            let newW = startW;
            let newH = startH;
            let newX = startPosX;
            let newY = startPosY;

            if (direction.includes('e')) newW = Math.max(20, startW + dx);
            if (direction.includes('w')) {
                newW = Math.max(20, startW - dx);
                newX = startPosX + dx;
            }
            if (direction.includes('s')) newH = Math.max(20, startH + dy);
            if (direction.includes('n')) {
                newH = Math.max(20, startH - dy);
                newY = startPosY + dy;
            }

            updateElement(id, { x: newX, y: newY, width: newW, height: newH });
        };

        const onEnd = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onEnd);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onEnd);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd);
    };

    return { isDragging, handleStart, handleMove, handleEnd, handleResizeStart, guides, selectionBox };
};
