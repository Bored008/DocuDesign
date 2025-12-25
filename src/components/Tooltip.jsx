import React from 'react';

const Tooltip = ({ text, children }) => (
    <div className="group relative flex items-center justify-center">
        {children}
        <div className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
            {text}
        </div>
    </div>
);

export default Tooltip;
