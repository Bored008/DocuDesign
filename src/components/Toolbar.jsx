import React, { useState, useEffect, useRef } from 'react';
import { Type, Square, Circle, Triangle, Minus, Hexagon, Shapes as ShapesIcon, Settings, Upload, Layout, Undo2, Redo2, ChevronRight, Sparkles, Trash2 } from 'lucide-react';
import Tooltip from './Tooltip';

const Toolbar = ({
    addElement,
    handleImageUpload,
    selectedId,
    selectedIds,
    undo,
    redo,
    canUndo,
    canRedo,
    showMobileProps,
    setShowMobileProps,
    setShowTemplatesPanel,
    onOpenAIScan,
    clearCanvas,
    theme
}) => {
    const [showShapeMenu, setShowShapeMenu] = useState(false);
    const [showUploadMenu, setShowUploadMenu] = useState(false);

    const shapeRef = useRef(null);
    const uploadRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (shapeRef.current && !shapeRef.current.contains(event.target)) {
                setShowShapeMenu(false);
            }
            if (uploadRef.current && !uploadRef.current.contains(event.target)) {
                setShowUploadMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`order-2 md:order-1 h-20 md:h-full w-full md:w-24 border-t md:border-r md:border-t-0 flex flex-row md:flex-col items-center justify-around md:justify-start px-2 py-2 md:py-8 gap-1 md:gap-8 z-50 shrink-0 transition-all duration-300 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 backdrop-blur-xl shadow-2xl' : 'bg-white border-slate-200 shadow-none'}`}>
            <div className={`hidden md:block font-black text-xl mb-4 tracking-wider transition-colors ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>DD</div>

            {/* Undo/Redo Group */}
            <div className="flex md:flex-col gap-1 md:gap-4 md:mb-4">
                <button
                    onClick={undo}
                    disabled={!canUndo}
                    className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-2xl transition-all duration-200 gap-1 ${!canUndo ? 'opacity-20 cursor-not-allowed' : theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                    <Undo2 size={20} md:size={18} strokeWidth={2.5} />
                    <span className="text-[9px] md:text-[10px] font-black leading-none uppercase tracking-widest hidden sm:inline md:inline">Undo</span>
                </button>
                <button
                    onClick={redo}
                    disabled={!canRedo}
                    className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-2xl transition-all duration-200 gap-1 ${!canRedo ? 'opacity-20 cursor-not-allowed' : theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                    <Redo2 size={20} md:size={18} strokeWidth={2.5} />
                    <span className="text-[9px] md:text-[10px] font-black leading-none uppercase tracking-widest hidden sm:inline md:inline">Redo</span>
                </button>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 md:hidden" />

            <Tooltip text="Add Text">
                <button onClick={() => addElement('text')} className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-2xl transition-all duration-200 gap-1 ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-indigo-400' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
                    <Type size={20} md:size={22} strokeWidth={2.5} />
                    <span className="text-[9px] md:text-[10px] font-black leading-none uppercase tracking-widest hidden sm:inline md:inline">Text</span>
                </button>
            </Tooltip>

            {/* Shapes Flyout */}
            <div className="relative" ref={shapeRef}>
                <Tooltip text="Shapes">
                    <button
                        onClick={() => { setShowShapeMenu(!showShapeMenu); setShowUploadMenu(false); }}
                        className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-2xl transition-all duration-200 gap-1 ${showShapeMenu ? 'bg-indigo-600 text-white shadow-lg' : theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-indigo-400' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'}`}
                    >
                        <ShapesIcon size={20} md:size={22} strokeWidth={2.5} />
                        <span className="text-[9px] md:text-[10px] font-black leading-none uppercase tracking-widest hidden sm:inline md:inline">Shapes</span>
                    </button>
                </Tooltip>

                {showShapeMenu && (
                    <div className={`absolute bottom-full mb-4 md:bottom-0 md:left-full md:mb-0 md:ml-4 p-2 rounded-3xl shadow-2xl border flex flex-row md:flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-left-4 duration-200 z-100 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} flex-wrap w-[200px] md:w-auto`}>
                        <button
                            onClick={() => { addElement('box'); setShowShapeMenu(false); }}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'} w-1/4 md:w-full`}
                        >
                            <Square size={20} strokeWidth={2.5} />
                            <span className="text-[8px] font-black uppercase hidden md:block">Square</span>
                        </button>
                        <button
                            onClick={() => { addElement('circle'); setShowShapeMenu(false); }}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'} w-1/4 md:w-full`}
                        >
                            <Circle size={20} strokeWidth={2.5} />
                            <span className="text-[8px] font-black uppercase hidden md:block">Circle</span>
                        </button>
                        <button
                            onClick={() => { addElement('line'); setShowShapeMenu(false); }}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'} w-1/4 md:w-full`}
                        >
                            <Minus size={20} strokeWidth={2.5} />
                            <span className="text-[8px] font-black uppercase hidden md:block">Line</span>
                        </button>
                        <button
                            onClick={() => { addElement('triangle'); setShowShapeMenu(false); }}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'} w-1/4 md:w-full`}
                        >
                            <Triangle size={20} strokeWidth={2.5} />
                            <span className="text-[8px] font-black uppercase hidden md:block">Triangle</span>
                        </button>
                        <button
                            onClick={() => { addElement('polygon'); setShowShapeMenu(false); }}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'} w-1/4 md:w-full`}
                        >
                            <Hexagon size={20} strokeWidth={2.5} />
                            <span className="text-[8px] font-black uppercase hidden md:block">Polygon</span>
                        </button>
                    </div>
                )}
            </div>

            <Tooltip text="Templates">
                <button onClick={() => setShowTemplatesPanel(true)} className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-2xl transition-all duration-200 gap-1 ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-indigo-400' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
                    <Layout size={20} md:size={22} strokeWidth={2.5} />
                    <span className="text-[9px] md:text-[10px] font-black leading-none uppercase tracking-widest hidden sm:inline md:inline">Templates</span>
                </button>
            </Tooltip>

            {/* Upload Flyout */}
            <div className="relative" ref={uploadRef}>
                <Tooltip text="Upload & AI">
                    <button
                        onClick={() => { setShowUploadMenu(!showUploadMenu); setShowShapeMenu(false); }}
                        className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-2xl transition-all duration-200 gap-1 ${showUploadMenu ? 'bg-indigo-600 text-white shadow-lg' : theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-emerald-400' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'}`}
                    >
                        <Upload size={20} md:size={22} strokeWidth={2.5} />
                        <span className="text-[9px] md:text-[10px] font-black leading-none uppercase tracking-widest hidden sm:inline md:inline">Upload</span>
                    </button>
                </Tooltip>

                {showUploadMenu && (
                    <div className={`absolute bottom-full mb-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:bg-transparent md:bottom-0 md:left-full md:mb-0 md:ml-4 p-2 rounded-3xl shadow-2xl border flex flex-row md:flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-left-4 duration-200 z-100 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <label className={`cursor-pointer flex flex-col items-center gap-1.5 p-3 rounded-2xl w-20 md:w-24 transition-all ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                            <Upload size={20} strokeWidth={2.5} />
                            <span className="text-[8px] font-black uppercase text-center w-full">Image</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => { handleImageUpload(e); setShowUploadMenu(false); }} />
                        </label>
                        <button
                            onClick={() => { onOpenAIScan(); setShowUploadMenu(false); }}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl w-20 md:w-24 transition-all ${theme === 'dark' ? 'text-amber-400 hover:bg-slate-800 hover:text-amber-300' : 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'}`}
                        >
                            <Sparkles size={20} strokeWidth={2.5} />
                            <span className="text-[8px] font-black uppercase text-center w-full">Magic AI</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile Toggle for Properties if hidden */}
            {selectedId && !showMobileProps && (
                <button
                    onClick={() => setShowMobileProps(true)}
                    className={`md:hidden p-3 rounded-2xl animate-pulse flex flex-col items-center gap-1 ${theme === 'dark' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}
                >
                    <Settings size={20} strokeWidth={2.5} />
                    <span className="text-[9px] font-black leading-none uppercase tracking-widest">Edit</span>
                </button>
            )}

            <div className="flex-1 hidden md:block" />

            {/* Clear All Button */}
            <Tooltip text="Clear Canvas">
                <button
                    onClick={clearCanvas}
                    className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-2xl transition-all duration-200 gap-1 border border-transparent ${theme === 'dark' ? 'text-red-400 hover:bg-red-950/30 hover:border-red-900/50' : 'text-red-600 hover:bg-red-50 hover:border-red-100'}`}
                >
                    <Trash2 size={20} strokeWidth={2.5} />
                    <span className="text-[9px] md:text-[10px] font-black leading-none uppercase tracking-widest hidden sm:inline md:inline">Clear</span>
                </button>
            </Tooltip>
        </div>
    );
};

export default Toolbar;
