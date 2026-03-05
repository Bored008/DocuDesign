import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Trash2,
  Download,
  Save,
  Loader2,
  CheckCircle2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon
} from 'lucide-react';

import { A4_WIDTH_PX, A4_HEIGHT_PX } from './constants/dimensions';
import AIScannerModal from './components/AIScannerModal';
import ResizeHandle from './components/ResizeHandle';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import TemplatesPanel from './components/TemplatesPanel';
import { useScale } from './hooks/useScale';
import { useInteraction } from './hooks/useInteraction';

import { exportToPDF, exportToImage, exportToWord } from './utils/exportUtils';
import LandingPage from './landingpage/LandingPage';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [elements, setElements] = useState(() => {
    const saved = localStorage.getItem('canvas_elements');
    return saved ? JSON.parse(saved) : [
      {
        id: 'header-1',
        type: 'text',
        content: 'PRACTICAL FILE',
        x: 200,
        y: 100,
        width: 600,
        height: 80,
        styles: {
          fontSize: 48,
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#000000',
          fontFamily: 'serif'
        }
      },
      {
        id: 'sub-1',
        type: 'text',
        content: 'Submitted by: [Your Name]',
        x: 250,
        y: 900,
        width: 300,
        height: 40,
        styles: {
          fontSize: 20,
          textAlign: 'center',
          color: '#333333',
          fontFamily: 'sans-serif'
        }
      }
    ];
  });

  const [selectedIds, setSelectedIds] = useState([]);
  const [showMobileProps, setShowMobileProps] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showTemplatesPanel, setShowTemplatesPanel] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Undo/Redo State
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'light');
  const [designId, setDesignId] = useState(() => localStorage.getItem('design_id') || null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [canvasScale, setCanvasScale] = useScale(A4_WIDTH_PX, A4_HEIGHT_PX);
  const [zoomInputValue, setZoomInputValue] = useState(Math.round(canvasScale * 100));

  useEffect(() => {
    setZoomInputValue(Math.round(canvasScale * 100));
  }, [canvasScale]);

  const handleZoomInput = (e) => {
    const value = e.target.value;
    setZoomInputValue(value);
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue)) {
      const newScale = Math.min(Math.max(numericValue / 100, 0.1), 3.0);
      setCanvasScale(newScale);
    }
  };

  const exportMenuRef = useRef(null);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('canvas_elements', JSON.stringify(elements));
    localStorage.setItem('app_theme', theme);
  }, [elements, theme]);

  // Load from database if localStorage is empty or on fresh load
  useEffect(() => {
    const fetchData = async () => {
      // If we have a designId but localStorage is empty, or just to sync
      if (!localStorage.getItem('canvas_elements')) {
        try {
          const res = await axios.get(`${API_BASE}/latest`);
          if (res.data.success && res.data.data) {
            setElements(res.data.data.elements);
            setTheme(res.data.data.theme || 'light');
            setDesignId(res.data.data._id);
          }
        } catch (err) {
          console.error("Sync error:", err);
        }
      }
    };
    fetchData();
  }, []);

  const onSelectTemplate = (templateElements) => {
    if (confirm("Applying a layout will replace your current design. Continue?")) {
      setElements(templateElements);
      setShowTemplatesPanel(false);
      setSelectedIds([]);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const clearCanvas = () => {
    if (confirm("Are you sure you want to clear the entire canvas? This cannot be undone.")) {
      saveToHistory();
      setElements([]);
      setSelectedIds([]);
    }
  };

  const handleScanComplete = (newElements, backgroundImage = null, imageDimensions = null) => {
    saveToHistory();

    // Scale coordinates back to A4 dimensions (794x1123)
    const scaleX = imageDimensions?.width ? A4_WIDTH_PX / imageDimensions.width : 1;
    const scaleY = imageDimensions?.height ? A4_HEIGHT_PX / imageDimensions.height : 1;
    const uniformScale = Math.min(scaleX, scaleY);

    // For overlay mode, we only want the text
    const filteredElements = backgroundImage
      ? newElements.filter(el => el.type === 'text')
      : newElements;

    const processedElements = filteredElements.map((el, index) => {
      const fontSize = el.styles?.fontSize || 16;
      const extraPadding = backgroundImage ? 6 : 0;

      // AI now returns normalized A4 coordinates, so we use them DIRECTLY.
      // No scaling needed unless we are in overlay mode (which is disabled for this fix).
      const finalX = el.x || 0;
      const finalY = el.y || 0;
      const finalWidth = (el.width || 200) + (extraPadding * 2);

      // Ensure height is reasonable
      const elHeight = el.height || 30;
      const finalHeight = Math.max(elHeight, Math.round(fontSize * 1.3)) + extraPadding;

      let bgColor = el.styles?.backgroundColor || 'transparent';
      if (backgroundImage) {
        if (!bgColor || bgColor === 'transparent' || bgColor === 'rgba(0,0,0,0)') {
          bgColor = '#FFFFFF';
        }
      }

      return {
        ...el,
        id: el.id || `scanned-${Date.now()}-${index}`,
        x: finalX - extraPadding,
        y: finalY - (extraPadding / 2),
        width: finalWidth,
        height: finalHeight,
        styles: {
          fontFamily: el.styles?.fontFamily || "'Times New Roman', serif",
          textAlign: el.styles?.textAlign || 'left',
          color: el.styles?.color || '#000000',
          fontWeight: el.styles?.fontWeight || 'normal',
          padding: backgroundImage ? 4 : 0,
          ...el.styles,
          fontSize: fontSize, // Use raw font size from AI
          backgroundColor: bgColor,
          borderStyle: el.styles?.borderStyle || (el.styles?.borderWidth > 0 ? 'solid' : 'none')
        }
      };
    });

    if (backgroundImage) {
      const bgElement = {
        id: `bg-${Date.now()}`,
        type: 'image',
        content: backgroundImage,
        x: 0,
        y: 0,
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        locked: true,
        styles: {
          borderRadius: 0,
          opacity: 1,
          pointerEvents: 'none'
        }
      };
      setElements([bgElement, ...processedElements]);
    } else {
      setElements(processedElements);
    }

    alert('Design replicated successfully! You can now edit the elements.');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await axios.post(`${API_BASE}/save`, {
        elements,
        theme,
        id: designId
      });
      if (res.data.success) {
        setDesignId(res.data.id);
        localStorage.setItem('design_id', res.data.id);
        setLastSaved(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedElement = elements.find(el => selectedIds.includes(el.id));

  const saveToHistory = (newElements) => {
    setHistory(prev => [...prev.slice(-19), elements]); // Keep last 20 states
    setRedoStack([]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack(prev => [...prev, elements]);
    setElements(previous);
    setHistory(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory(prev => [...prev, elements]);
    setElements(next);
    setRedoStack(prev => prev.slice(0, -1));
  };

  const updateElement = (id, updates, recordHistory = true) => {
    if (recordHistory) saveToHistory();
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const handleAlign = (id, alignment) => {
    saveToHistory();
    setElements(prev => prev.map(el => {
      if (el.id !== id) return el;
      let newX = el.x;
      let newY = el.y;

      switch (alignment) {
        case 'left': newX = 0; break;
        case 'center': newX = (A4_WIDTH_PX - el.width) / 2; break;
        case 'right': newX = A4_WIDTH_PX - el.width; break;
        case 'top': newY = 0; break;
        case 'middle': newY = (A4_HEIGHT_PX - el.height) / 2; break;
        case 'bottom': newY = A4_HEIGHT_PX - el.height; break;
      }
      return { ...el, x: newX, y: newY };
    }));
  };

  const deleteElements = (ids = selectedIds) => {
    if (ids.length === 0) return;
    saveToHistory();
    setElements(prev => prev.filter(el => !ids.includes(el.id)));
    setSelectedIds([]);
  };

  const {
    isDragging,
    handleStart,
    handleMove,
    handleEnd,
    handleResizeStart,
    guides,
    selectionBox
  } = useInteraction(elements, canvasScale, (id, updates) => updateElement(id, updates, false));

  const updateStyles = (id, newStyles) => {
    saveToHistory();
    let layerAction = newStyles.layerAction;
    const cleanStyles = { ...newStyles };
    delete cleanStyles.layerAction;

    setElements(prev => {
      let currentElements = prev.map(el => {
        if (el.id === id) {
          let updates = { styles: { ...el.styles, ...cleanStyles } };
          if (newStyles.fontSize && el.type === 'text' && el.styles.fontSize) {
            const ratio = newStyles.fontSize / el.styles.fontSize;
            updates.width = el.width * ratio;
            updates.height = el.height * ratio;
          }
          return { ...el, ...updates };
        }
        return el;
      });

      if (layerAction === 'front') {
        const item = currentElements.find(el => el.id === id);
        return [...currentElements.filter(el => el.id !== id), item];
      }
      if (layerAction === 'back') {
        const item = currentElements.find(el => el.id === id);
        // Put it after the background image if it exists
        const bg = currentElements.find(el => el.locked);
        if (bg) {
          return [bg, item, ...currentElements.filter(el => el.id !== id && !el.locked)];
        }
        return [item, ...currentElements.filter(el => el.id !== id)];
      }
      return currentElements;
    });
  };

  const addElement = (type, initialStyles = {}) => {
    saveToHistory();
    const isShape = ['box', 'circle', 'line', 'triangle', 'polygon'].includes(type);

    let elWidth = type === 'text' ? 300 : (type === 'line' ? 300 : 200);
    let elHeight = type === 'text' ? 100 : (type === 'line' ? 2 : 200);

    let clipPathValue = 'none';
    if (type === 'triangle') {
      clipPathValue = 'polygon(50% 0%, 0% 100%, 100% 100%)';
    } else if (type === 'polygon') {
      clipPathValue = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'; // Hexagon By Default
    }

    const newElement = {
      id: `el-${Date.now()}`,
      type: type,
      x: 150,
      y: 150,
      width: elWidth,
      height: elHeight,
      content: type === 'text' ? 'Double tap to edit' : '',
      styles: {
        fontSize: 16,
        color: '#000000',
        backgroundColor: isShape && type !== 'line' ? '#e2e8f0' : (type === 'line' ? '#000000' : 'transparent'),
        textAlign: 'left',
        borderWidth: 0,
        borderColor: '#000000',
        borderRadius: type === 'circle' ? 9999 : 0,
        borderStyle: 'solid',
        clipPath: clipPathValue,
        ...initialStyles
      }
    };
    setElements([...elements, newElement]);
    setSelectedIds([newElement.id]);
    setShowMobileProps(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        saveToHistory();
        const newElement = {
          id: `img-${Date.now()}`,
          type: 'image',
          x: 200,
          y: 200,
          width: 200,
          height: 200,
          content: reader.result,
          styles: {
            borderRadius: 0,
            borderWidth: 0,
            borderColor: '#000000',
            borderStyle: 'solid'
          }
        };
        setElements([...elements, newElement]);
        setSelectedIds([newElement.id]);
        setShowMobileProps(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.getAttribute('contenteditable')) return;
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      const isMod = e.ctrlKey || e.metaKey;

      if (isMod) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        } else if (e.key === 's') {
          e.preventDefault();
          handleSave();
        }
      } else {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          deleteElements();
        } else if (e.key.startsWith('Arrow')) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const moves = { x: 0, y: 0 };
          if (e.key === 'ArrowUp') moves.y = -step;
          if (e.key === 'ArrowDown') moves.y = step;
          if (e.key === 'ArrowLeft') moves.x = -step;
          if (e.key === 'ArrowRight') moves.x = step;

          if (selectedIds.length > 0) {
            saveToHistory();
            setElements(prev => prev.map(el => {
              if (selectedIds.includes(el.id)) {
                return { ...el, x: el.x + moves.x, y: el.y + moves.y };
              }
              return el;
            }));
          }
        }
      }

      // Universal Zoom Shortcuts (Ctrl +, Ctrl -, Ctrl 0)
      if (isMod) {
        if (e.key === '=' || e.key === '+') { // Handle + and = (often same key)
          e.preventDefault();
          setCanvasScale(s => Math.min(3.0, s + 0.1));
        } else if (e.key === '-') {
          e.preventDefault();
          setCanvasScale(s => Math.max(0.1, s - 0.1));
        } else if (e.key === '0') {
          e.preventDefault();
          setCanvasScale(1.0); // Reset to 100% or fit? usually 100%
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [elements, selectedIds]);

  if (showLandingPage) {
    return <LandingPage onGoToEditor={() => setShowLandingPage(false)} />;
  }

  return (
    <div
      className={`flex flex-col md:flex-row h-screen w-full overflow-hidden font-sans transition-colors duration-300 ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}
      onMouseUp={() => handleEnd(setSelectedIds)}
      onMouseMove={(e) => handleMove(e, selectedIds, elements.filter(el => selectedIds.includes(el.id)))}
      onTouchEnd={() => handleEnd(setSelectedIds)}
      onTouchMove={(e) => handleMove(e, selectedIds, elements.filter(el => selectedIds.includes(el.id)))}
    >

      <Toolbar
        addElement={addElement}
        handleImageUpload={handleImageUpload}
        selectedId={selectedIds[0] || null}
        selectedIds={selectedIds}
        undo={undo}
        redo={redo}
        canUndo={history.length > 0}
        canRedo={redoStack.length > 0}
        showMobileProps={showMobileProps}
        setShowMobileProps={setShowMobileProps}
        setShowTemplatesPanel={setShowTemplatesPanel}
        onOpenAIScan={() => setShowScanner(true)}
        clearCanvas={clearCanvas}
        theme={theme}
      />

      {/* --- Main Workspace --- */}
      <div className="flex-1 flex flex-col relative order-1 md:order-2 overflow-hidden">
        {/* Top Bar */}
        <div className={`h-14 md:h-16 border-b flex items-center justify-between px-3 md:px-8 shadow-sm z-20 shrink-0 transition-colors ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 md:gap-6">
            <h1 className="font-bold text-sm md:text-xl tracking-tight truncate max-w-[100px] md:max-w-none">DOCDESIGN</h1>
            <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Canvas Active
            </div>
          </div>
          <div className="flex gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all duration-200 ${theme === 'dark' ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
              )}
            </button>

            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : lastSaved ? (
                <CheckCircle2 size={18} className="text-green-500" />
              ) : (
                <Save size={18} />
              )}
              <span className="hidden sm:inline">
                {isSaving ? 'Saving...' : lastSaved ? `Saved ${lastSaved}` : 'Save'}
              </span>
            </button>
            <div className="relative" ref={exportMenuRef}>
              <button
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] transition-all active:scale-95"
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <Download size={18} /> <span className="hidden sm:inline">Export</span>
              </button>

              {showExportMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <button
                    onClick={async () => {
                      setShowExportMenu(false);
                      await exportToPDF('print-area');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">PDF</div>
                    Save as PDF
                  </button>
                  <button
                    onClick={async () => {
                      setShowExportMenu(false);
                      await exportToImage('print-area', 'png');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">IMG</div>
                    Save as Image
                  </button>
                  <button
                    onClick={async () => {
                      setShowExportMenu(false);
                      await exportToWord(elements);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">DOC</div>
                    Save as Word
                  </button>
                  <div className={`my-1 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`} />
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      window.print();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>P</div>
                    Print Quality
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Canvas Area - SCROLLABLE WITHOUT CUTTING OFF CONTENT */}
        <div className={`flex-1 overflow-auto p-4 md:p-8 pb-32 md:pb-8 relative touch-none transition-colors ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
          <div
            style={{
              width: `${A4_WIDTH_PX * canvasScale}px`,
              height: `${A4_HEIGHT_PX * canvasScale}px`,
              margin: '0 auto' // Centers horizontally if smaller than viewport
            }}
            className="transition-all duration-200 ease-out shadow-2xl shrink-0 relative"
          >
            <div
              id="print-area"
              className="bg-white absolute top-0 left-0 origin-top-left select-none"
              style={{
                width: `${A4_WIDTH_PX}px`,
                height: `${A4_HEIGHT_PX}px`,
                transform: `scale(${canvasScale})`,
                touchAction: 'none'
              }}
              onClick={() => {
                setSelectedIds([]);
                setShowMobileProps(false);
              }}
            >
              {/* Grid Pattern */}
              <div
                id="grid-pattern"
                className="absolute inset-0 pointer-events-none opacity-50"
                style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}
              />

              {/* Smart Alignment Guides */}
              {isDragging && guides.y !== null && (
                <div
                  className={`absolute left-0 right-0 border-t z-[100] transition-all pointer-events-none ${guides.labelY && guides.labelY.includes('CENTERED') ? 'border-amber-500 border-2' : 'border-indigo-500'}`}
                  style={{ top: guides.y }}
                >
                  <div className={`absolute left-2 -top-2 text-white text-[8px] px-1 rounded font-bold uppercase tracking-wider ${guides.labelY && guides.labelY.includes('CENTERED') ? 'bg-amber-600' : 'bg-indigo-600'}`}>{guides.labelY || 'Alignment Y'}</div>
                </div>
              )}
              {isDragging && guides.x !== null && (
                <div
                  className={`absolute top-0 bottom-0 border-l z-[100] transition-all pointer-events-none ${guides.labelX && guides.labelX.includes('CENTERED') ? 'border-amber-500 border-2' : 'border-indigo-500'}`}
                  style={{ left: guides.x }}
                >
                  <div className={`absolute top-2 -left-2 text-white text-[8px] px-1 rounded font-bold uppercase tracking-wider origin-left -rotate-90 ${guides.labelX && guides.labelX.includes('CENTERED') ? 'bg-amber-600' : 'bg-indigo-600'}`}>{guides.labelX || 'Alignment X'}</div>
                </div>
              )}

              {/* Distances Indicators */}
              {isDragging && guides.distances && guides.distances.map((dist, i) => (
                <div key={i} className="absolute pointer-events-none z-[90]" style={{ left: dist.x, top: dist.y }}>
                  {dist.type === 'horizontal' ? (
                    <div className="relative flex flex-col items-center">
                      <div className={`h-[2px] border-t-2 border-dashed ${dist.isEdge ? 'border-sky-500' : 'border-rose-500'}`} style={{ width: dist.w }} />
                      <div className={`absolute top-2 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border ${dist.isEdge ? 'bg-sky-600 border-sky-400' : 'bg-rose-600 border-rose-400'}`}>
                        {dist.value}px
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex items-center">
                      <div className={`w-[2px] border-l-2 border-dashed ${dist.isEdge ? 'border-sky-500' : 'border-rose-500'}`} style={{ height: dist.h }} />
                      <div className={`absolute left-2 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border ${dist.isEdge ? 'bg-sky-600 border-sky-400' : 'bg-rose-600 border-rose-400'}`}>
                        {dist.value}px
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {elements.map((el) => {
                const isLocked = el.locked;
                const isSelected = selectedIds.includes(el.id);

                return (
                  <div
                    key={el.id}
                    onClick={(e) => !isLocked && e.stopPropagation()}
                    onMouseDown={(e) => !isLocked && handleStart(e, el.id, setSelectedIds, setShowMobileProps)}
                    onTouchStart={(e) => !isLocked && handleStart(e, el.id, setSelectedIds, setShowMobileProps)}
                    className={`absolute group transition-shadow ${isSelected && !isLocked ? 'z-50 ring-2 ring-blue-500 ring-offset-0 shadow-lg' : !isLocked ? 'hover:ring-1 hover:ring-blue-300' : ''}`}
                    style={{
                      left: el.x,
                      top: el.y,
                      width: el.width,
                      height: el.height,
                      zIndex: isLocked ? 0 : (el.styles?.zIndex || 10),
                      pointerEvents: isLocked ? 'none' : 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      ...el.styles,
                      // Ensure essential layout constraints are NOT overridden by el.styles
                      position: 'absolute',
                    }}
                  >
                    {/* Content Render */}
                    {el.type === 'text' && (
                      <div
                        contentEditable={!isLocked}
                        suppressContentEditableWarning
                        spellCheck={false}
                        onBlur={(e) => updateElement(el.id, { content: e.target.innerText })}
                        onFocus={() => setSelectedIds([el.id])}
                        onTouchStart={(e) => e.stopPropagation()}
                        className="w-full h-full p-0 outline-none cursor-text select-text flex items-center"
                        style={{
                          cursor: isDragging ? 'move' : (isLocked ? 'default' : 'text'),
                          justifyContent: el.styles?.textAlign === 'center' ? 'center' : (el.styles?.textAlign === 'right' ? 'flex-end' : 'flex-start'),
                          textAlign: el.styles?.textAlign || 'left',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          lineHeight: 1.1,
                          padding: '2px 4px'
                        }}
                      >
                        {el.content}
                      </div>
                    )}

                    {el.type === 'image' && (
                      el.content ? (
                        <img src={el.content} alt="Content" className="w-full h-full object-contain pointer-events-none" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-400">
                          <ImageIcon size={el.width < 40 ? 16 : 24} />
                          {el.width > 60 && <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Logo/Image</span>}
                        </div>
                      )
                    )}

                    {['box', 'circle', 'line', 'triangle', 'polygon'].includes(el.type) && (
                      <div className="w-full h-full" style={{
                        backgroundColor: el.styles?.backgroundColor || 'transparent',
                        border: `${el.styles?.borderWidth || 0}px ${el.styles?.borderStyle || 'solid'} ${el.styles?.borderColor || 'transparent'}`,
                        borderRadius: `${el.styles?.borderRadius || 0}px`,
                        clipPath: el.styles?.clipPath || 'none'
                      }} />
                    )}

                    {/* Selection Overlay & Resizers */}
                    {isSelected && selectedIds.length === 1 && !isLocked && (
                      <>
                        <ResizeHandle cursor="cursor-nw-resize" position="nw" onStart={(e) => handleResizeStart(e, 'nw', el.id)} />
                        <ResizeHandle cursor="cursor-ne-resize" position="ne" onStart={(e) => handleResizeStart(e, 'ne', el.id)} />
                        <ResizeHandle cursor="cursor-sw-resize" position="sw" onStart={(e) => handleResizeStart(e, 'sw', el.id)} />
                        <ResizeHandle cursor="cursor-se-resize" position="se" onStart={(e) => handleResizeStart(e, 'se', el.id)} />

                        {/* Delete Button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteElements([el.id]); }}
                          onTouchEnd={(e) => { e.stopPropagation(); deleteElements([el.id]); }}
                          className="absolute -top-12 -right-4 md:-top-10 md:right-0 p-2 bg-red-500 text-white rounded-full shadow-md z-30"
                        >
                          <Trash2 size={20} />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Marquee Selection Box */}
              {selectionBox && (
                <div
                  className="absolute border border-blue-500 bg-blue-500/10 z-[1000] pointer-events-none"
                  style={{
                    left: selectionBox.x,
                    top: selectionBox.y,
                    width: selectionBox.width,
                    height: selectionBox.height
                  }}
                />
              )}
            </div>
          </div>

          {/* Zoom Controls Area - Centered Bottom */}

        </div>
      </div>

      <PropertiesPanel
        selectedElement={selectedElement}
        showMobileProps={showMobileProps}
        setShowMobileProps={setShowMobileProps}
        updateStyles={updateStyles}
        handleAlign={handleAlign}
        theme={theme}
      />

      <AIScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanComplete={handleScanComplete}
        theme={theme}
      />

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            transform: none !important;
            box-shadow: none !important;
          }
          /* Hide UI elements during print */
          button, .resize-handle {
            display: none !important;
          }
        }
      `}</style>
      <TemplatesPanel
        isOpen={showTemplatesPanel}
        onClose={() => setShowTemplatesPanel(false)}
        onSelectTemplate={onSelectTemplate}
        currentElements={elements}
        theme={theme}
      />
    </div>
  );
}
