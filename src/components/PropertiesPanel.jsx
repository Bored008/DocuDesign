import React from 'react';
import { Bold, Italic, Underline, X, AlignLeft, AlignCenter, AlignRight, Move } from 'lucide-react';

const PropertiesPanel = ({
    selectedElement,
    showMobileProps,
    setShowMobileProps,
    updateStyles,
    handleAlign,
    theme
}) => {
    if (!selectedElement) {
        return (
            <div className={`hidden md:flex w-72 border-l border-gray-200 p-8 flex-col items-center justify-center text-center z-30 order-3 transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <Move size={32} className={`${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`} />
                </div>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Select an element to refine its properties</p>
            </div>
        );
    }

    if (!showMobileProps && window.innerWidth < 768) return null;

    const sectionClass = `fixed md:relative bottom-0 md:bottom-auto left-0 right-0 md:left-auto md:right-auto md:w-72 h-[60vh] md:h-full border-t md:border-l p-6 flex flex-col gap-6 overflow-y-auto z-[60] md:z-40 order-3 animate-in slide-in-from-bottom duration-300 transition-all rounded-t-[32px] md:rounded-none ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.5)]' : 'bg-white border-slate-200 text-slate-900 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.1)]'}`;

    return (
        <div className={sectionClass}>
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-2 md:hidden shrink-0" />

            <div className="flex justify-between items-center">
                <h3 className={`text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'text-indigo-400' : 'text-slate-800'}`}>Properties</h3>
                <button
                    onClick={() => setShowMobileProps(false)}
                    className={`p-2 rounded-xl md:hidden ${theme === 'dark' ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}
                >
                    <X size={20} />
                </button>
            </div>

            <div className="hidden md:block">
                <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 ${theme === 'dark' ? 'text-indigo-400' : 'text-slate-400'}`}>Element Settings</h3>
            </div>

            {/* Typography */}
            {selectedElement.type === 'text' && (
                <div className="space-y-6">
                    <label className="block">
                        <span className={`text-[10px] font-black mb-3 block uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Font Size</span>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="12"
                                max="120"
                                value={selectedElement.styles.fontSize}
                                onChange={(e) => updateStyles(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                                className="flex-1 accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-800"
                            />
                            <span className={`text-xs font-mono font-bold w-8 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{selectedElement.styles.fontSize}</span>
                        </div>
                    </label>

                    <div className="flex gap-2">
                        <button
                            onClick={() => updateStyles(selectedElement.id, { fontWeight: selectedElement.styles.fontWeight === 'bold' ? 'normal' : 'bold' })}
                            className={`flex-1 p-2.5 rounded-xl border transition-all ${selectedElement.styles.fontWeight === 'bold' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' : theme === 'dark' ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Bold size={18} strokeWidth={3} className="mx-auto" />
                        </button>
                        <button
                            onClick={() => updateStyles(selectedElement.id, { fontStyle: selectedElement.styles.fontStyle === 'italic' ? 'normal' : 'italic' })}
                            className={`flex-1 p-2.5 rounded-xl border transition-all ${selectedElement.styles.fontStyle === 'italic' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' : theme === 'dark' ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Italic size={18} strokeWidth={3} className="mx-auto" />
                        </button>
                        <button
                            onClick={() => updateStyles(selectedElement.id, { textDecoration: selectedElement.styles.textDecoration === 'underline' ? 'none' : 'underline' })}
                            className={`flex-1 p-2.5 rounded-xl border transition-all ${selectedElement.styles.textDecoration === 'underline' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' : theme === 'dark' ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Underline size={18} strokeWidth={3} className="mx-auto" />
                        </button>
                    </div>

                    <label className="block">
                        <span className={`text-[10px] font-black mb-3 block uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Typography</span>
                        <select
                            value={selectedElement.styles.fontFamily || 'sans-serif'}
                            onChange={(e) => updateStyles(selectedElement.id, { fontFamily: e.target.value })}
                            className={`w-full p-3 border rounded-xl text-sm font-bold transition-all focus:ring-2 focus:ring-indigo-500 outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
                        >
                            <option value="sans-serif">Sans Serif (System)</option>
                            <option value="serif">Serif (System)</option>
                            <option value="monospace">Monospace (System)</option>
                            <option value="'Inter', sans-serif">Inter (Modern Sans)</option>
                            <option value="'Outfit', sans-serif">Outfit (Geometric)</option>
                            <option value="'Roboto', sans-serif">Roboto (Clean Sans)</option>
                            <option value="'Playfair Display', serif">Playfair Display (Elegant Serif)</option>
                            <option value="'EB Garamond', serif">EB Garamond (Classic Serif)</option>
                            <option value="'JetBrains Mono', monospace">JetBrains Mono (Coding)</option>
                            <option value="'Dancing Script', cursive">Dancing Script (Handwritten)</option>
                        </select>
                    </label>

                    <div className={`flex rounded-xl p-1.5 shadow-inner ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                        {['left', 'center', 'right'].map((align) => (
                            <button
                                key={align}
                                onClick={() => updateStyles(selectedElement.id, { textAlign: align })}
                                className={`flex-1 py-1.5 rounded-lg transition-all ${selectedElement.styles.textAlign === align ? (theme === 'dark' ? 'bg-slate-800 text-indigo-400 shadow-xl' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-400'}`}
                            >
                                {align === 'left' && <AlignLeft size={18} strokeWidth={2.5} className="mx-auto" />}
                                {align === 'center' && <AlignCenter size={18} strokeWidth={2.5} className="mx-auto" />}
                                {align === 'right' && <AlignRight size={18} strokeWidth={2.5} className="mx-auto" />}
                            </button>
                        ))}
                    </div>

                    <label className="block">
                        <span className={`text-[10px] font-black mb-3 block uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Text Color</span>
                        <div className="grid grid-cols-6 gap-2 mb-4">
                            {[
                                '#000000', '#1e293b', '#475569', '#64748b', '#94a3b8', '#cbd5e1',
                                '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
                                '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
                                '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#ffffff', '#e2e8f0'
                            ].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => updateStyles(selectedElement.id, { color: c })}
                                    className={`w-7 h-7 rounded-lg border transition-all hover:scale-110 shadow-sm ${selectedElement.styles.color === c ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'border-black/5 dark:border-white/5'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                        <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${theme === 'dark' ? 'bg-slate-950 border-slate-800/50' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="relative w-10 h-10 shrink-0">
                                <input
                                    type="color"
                                    value={selectedElement.styles.color}
                                    onChange={(e) => updateStyles(selectedElement.id, { color: e.target.value })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div
                                    className="w-full h-full rounded-xl border-2 border-white shadow-xl"
                                    style={{ backgroundColor: selectedElement.styles.color }}
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>Hex Value</span>
                                <span className={`text-sm font-mono font-black uppercase ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{selectedElement.styles.color}</span>
                            </div>
                        </div>
                    </label>
                </div>
            )}

            {/* Shape Styles (Colors) */}
            {(selectedElement.type === 'box' || selectedElement.type === 'image') && (
                <div className="space-y-6">
                    <label className="block">
                        <span className={`text-[10px] font-black mb-3 block uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Fill / Tint Color</span>
                        <div className="grid grid-cols-6 gap-2 mb-4">
                            {[
                                '#000000', '#1e293b', '#475569', '#64748b', '#94a3b8', '#cbd5e1',
                                '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
                                '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
                                '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#ffffff'
                            ].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => updateStyles(selectedElement.id, { backgroundColor: selectedElement.type === 'box' ? c : undefined, color: selectedElement.type === 'text' ? c : undefined })}
                                    className={`w-7 h-7 rounded-lg border transition-all hover:scale-110 shadow-sm ${selectedElement.styles.backgroundColor === c ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'border-black/5 dark:border-white/5'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </label>
                </div>
            )}

            {/* Corner & Border Controls - UNIVERSAL */}
            <div className={`pt-6 border-t space-y-8 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>Appearance</h4>

                <label className="block">
                    <div className="flex justify-between items-center mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Corner Radius</span>
                        <span className={`text-xs font-mono font-bold ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{selectedElement.styles.borderRadius || 0}px</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="200"
                        value={selectedElement.styles.borderRadius || 0}
                        onChange={(e) => updateStyles(selectedElement.id, { borderRadius: parseInt(e.target.value) })}
                        className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-800"
                    />
                </label>

                <label className="block">
                    <div className="flex justify-between items-center mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Border Width</span>
                        <span className={`text-xs font-mono font-bold ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{selectedElement.styles.borderWidth || 0}px</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="20"
                        value={selectedElement.styles.borderWidth || 0}
                        onChange={(e) => updateStyles(selectedElement.id, { borderWidth: parseInt(e.target.value) })}
                        className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-800"
                    />
                </label>

                <div className="space-y-4">
                    <span className={`text-[10px] font-black block uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Align to Page</span>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => handleAlign && handleAlign(selectedElement.id, 'left')} className={`py-2 rounded-xl border text-[10px] font-bold uppercase transition-all ${theme === 'dark' ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Left</button>
                        <button onClick={() => handleAlign && handleAlign(selectedElement.id, 'center')} className={`py-2 rounded-xl border text-[10px] font-bold uppercase transition-all ${theme === 'dark' ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Center</button>
                        <button onClick={() => handleAlign && handleAlign(selectedElement.id, 'right')} className={`py-2 rounded-xl border text-[10px] font-bold uppercase transition-all ${theme === 'dark' ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Right</button>

                        <button onClick={() => handleAlign && handleAlign(selectedElement.id, 'top')} className={`py-2 rounded-xl border text-[10px] font-bold uppercase transition-all ${theme === 'dark' ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Top</button>
                        <button onClick={() => handleAlign && handleAlign(selectedElement.id, 'middle')} className={`py-2 rounded-xl border text-[10px] font-bold uppercase transition-all ${theme === 'dark' ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Middle</button>
                        <button onClick={() => handleAlign && handleAlign(selectedElement.id, 'bottom')} className={`py-2 rounded-xl border text-[10px] font-bold uppercase transition-all ${theme === 'dark' ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Bottom</button>
                    </div>
                </div>

                <div className="space-y-4">
                    <span className={`text-[10px] font-black block uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Layering</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => updateStyles(selectedElement.id, { layerAction: 'front' })}
                            className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all ${theme === 'dark' ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <span className="text-[10px] font-bold uppercase">To Front</span>
                        </button>
                        <button
                            onClick={() => updateStyles(selectedElement.id, { layerAction: 'back' })}
                            className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all ${theme === 'dark' ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <span className="text-[10px] font-bold uppercase">To Back</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertiesPanel;
