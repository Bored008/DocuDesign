import React, { useState } from 'react';
import { Sparkles, Upload, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import axios from 'axios';

const AIScannerModal = ({ isOpen, onClose, onScanComplete, theme }) => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');
    const [apiKey, setApiKey] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                // Get actual image dimensions
                const img = new Image();
                img.onload = () => {
                    setImageDimensions({ width: img.width, height: img.height });
                    console.log(`Image dimensions: ${img.width}x${img.height}`);
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleScan = async () => {
        if (!image) {
            setError('Please upload an image first.');
            return;
        }

        if (imageDimensions.width === 0) {
            setError('Still processing image dimensions. Please wait a second and try again.');
            return;
        }

        setScanning(true);
        setError('');

        const formData = new FormData();
        formData.append('image', image);
        formData.append('mode', 'reconstruct');
        formData.append('imageWidth', imageDimensions.width);
        formData.append('imageHeight', imageDimensions.height);
        if (apiKey) formData.append('apiKey', apiKey);

        try {
            const response = await axios.post('http://localhost:5000/api/ai-scan', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                // Return elements and image dimensions for scaling
                onScanComplete(
                    response.data.elements,
                    null,
                    imageDimensions
                );
                onClose();
            } else {
                setError(response.data.error || 'Failed to scan image.');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Server error during scan. Ensure server is running and API key is valid.');
        } finally {
            setScanning(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className={`relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl transition-all animate-in zoom-in-95 duration-200 ${theme === 'dark' ? 'bg-slate-900 border border-slate-800 text-slate-100' : 'bg-white text-slate-900'}`}>
                {/* Header */}
                <div className="p-6 pb-0 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                            <Sparkles size={24} fill="currentColor" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Magic Replicator</h2>
                            <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Turn sketches or screenshots into editable designs</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Upload Area */}
                    <div className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all group ${preview ? 'border-indigo-500 bg-indigo-50/10' : theme === 'dark' ? 'border-slate-800 hover:border-slate-700 hover:bg-slate-900' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                        {preview ? (
                            <div className="relative w-full h-48">
                                <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setImage(null);
                                        setPreview(null);
                                    }}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center pointer-events-none">
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                                    <ImageIcon size={32} />
                                </div>
                                <p className="font-bold text-sm mb-1">Click to upload or drag and drop</p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Supports JPG, PNG (Max 5MB)</p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            onChange={handleImageChange}
                            disabled={scanning}
                        />
                    </div>



                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={handleScan}
                        disabled={scanning || !image}
                        className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${scanning || !image ? 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600' : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]'}`}
                    >
                        {scanning ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Analyzing Layout...
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} fill="currentColor" />
                                Replicate Design
                            </>
                        )}
                    </button>

                    <p className={`text-center text-[10px] leading-relaxed ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
                        By using this feature, your image will be sent to Google Gemini for analysis.
                        Please ensure no sensitive data is present.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIScannerModal;
