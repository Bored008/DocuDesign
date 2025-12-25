import React, { useState, useEffect } from 'react';
import { Layout, X, Plus, Trash2, Search } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const TemplatesPanel = ({ isOpen, onClose, onSelectTemplate, currentElements, theme }) => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
        }
    }, [isOpen]);

    const fetchTemplates = async () => {
        try {
            const res = await axios.get(`${API_BASE}/templates`);
            if (res.data.success) {
                setTemplates(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch templates:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAsTemplate = async () => {
        const name = prompt("Enter a name for this layout template:");
        if (!name) return;

        try {
            const res = await axios.post(`${API_BASE}/templates`, {
                name,
                elements: currentElements,
                category: 'User',
                preview: '' // Could capture with html2canvas later
            });
            if (res.data.success) {
                setTemplates([...templates, res.data.data]);
                alert("Layout saved as template!");
            }
        } catch (err) {
            console.error("Template save error:", err);
            alert(`Failed to save template: ${err.response?.data?.error || err.message}`);
        }
    };

    if (!isOpen) return null;

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className={`relative w-full max-w-2xl h-[600px] rounded-3xl overflow-hidden shadow-2xl transition-all animate-in zoom-in-95 duration-200 ${theme === 'dark' ? 'bg-slate-900 text-slate-100 border border-slate-800' : 'bg-white text-slate-900'}`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                            <Layout size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Template Library</h2>
                            <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Choose a template or save your own</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className={`p-4 border-b flex gap-3 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className={`flex-1 flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-400 focus-within:border-indigo-500' : 'bg-slate-50 border-slate-200 focus-within:border-indigo-500'}`}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            className="bg-transparent border-none outline-none text-sm w-full font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleSaveAsTemplate}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        Save as Template
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 h-[calc(600px-180px)] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {/* Default Empty State if no templates */}
                            {filteredTemplates.length === 0 && (
                                <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                        <Layout size={40} className="opacity-20" />
                                    </div>
                                    <p className={`font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>No templates found</p>
                                    <p className="text-xs text-slate-500">Save your current design as a template to see it here</p>
                                </div>
                            )}

                            {filteredTemplates.map((template) => (
                                <div
                                    key={template._id}
                                    className={`group relative border rounded-2xl p-4 cursor-pointer transition-all hover:border-indigo-500 hover:shadow-xl ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}
                                    onClick={() => onSelectTemplate(template.elements)}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-sm truncate">{template.name}</h3>
                                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-indigo-600/10 text-indigo-500 rounded-md">
                                            {template.category}
                                        </span>
                                    </div>
                                    <div className={`h-32 rounded-xl flex items-center justify-center mb-1 overflow-hidden pointer-events-none transition-all group-hover:scale-[1.02] ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                                        {/* Preview placeholder */}
                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                            <Layout size={32} />
                                            <span className="text-[8px] font-bold uppercase">Template Preview</span>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-all rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <span className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase shadow-xl">Use Template</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemplatesPanel;
