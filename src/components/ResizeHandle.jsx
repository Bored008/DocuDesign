import React from 'react';

const ResizeHandle = ({ cursor, onStart, position }) => (
    <div
        onMouseDown={(e) => onStart(e, position)}
        onTouchStart={(e) => onStart(e, position)}
        className={`absolute w-6 h-6 md:w-3 md:h-3 bg-white border border-blue-500 rounded-full z-20 flex items-center justify-center shadow-sm ${cursor}`}
        style={{
            top: position.includes('n') ? -4 : position.includes('s') ? '100%' : '50%',
            left: position.includes('w') ? -4 : position.includes('e') ? '100%' : '50%',
            transform: 'translate(-50%, -50%)',
        }}
    />
);

export default ResizeHandle;
