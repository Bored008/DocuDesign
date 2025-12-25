import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';
import { saveAs } from 'file-saver';

// Helper to capture element at 1:1 scale regardless of screen zoom
const captureElement = async (elementId) => {
    const original = document.getElementById(elementId);
    if (!original) return null;

    // Clone the element to avoid modifying the specific live view
    const clone = original.cloneNode(true);

    // Reset any scaling on the clone
    clone.style.transform = 'none';
    clone.style.position = 'fixed';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.zIndex = '-9999'; // Hide behind everything
    clone.style.width = '794px'; // Force A4 width
    clone.style.height = '1123px'; // Force A4 height

    document.body.appendChild(clone);

    // Wait for images in clone to load/render if needed (usually instant for clone)
    try {
        const canvas = await html2canvas(clone, {
            scale: 2, // 2x for Retina-like quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: 794,
            height: 1123,
            windowWidth: 794,
            windowHeight: 1123
        });
        document.body.removeChild(clone);
        return canvas;
    } catch (err) {
        console.error("Capture failed:", err);
        if (document.body.contains(clone)) {
            document.body.removeChild(clone);
        }
        return null;
    }
};

export const exportToImage = async (elementId, format = 'png') => {
    const canvas = await captureElement(elementId);
    if (!canvas) {
        alert("Failed to generate image. Please try again.");
        return;
    }

    const dataUrl = canvas.toDataURL(`image/${format}`, 1.0);
    const link = document.createElement('a');
    link.download = `doc-design-${Date.now()}.${format}`;
    link.href = dataUrl;
    link.click();
};

export const exportToPDF = async (elementId) => {
    const canvas = await captureElement(elementId);
    if (!canvas) {
        alert("Failed to generate PDF. Please try again.");
        return;
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    // A4 size in px at 72dpi is roughly 595x842, but our canvas is at 794x1123 (96dpi)
    // jsPDF unit 'px' maps 1:1 to canvas pixels if configured right, or we use 'pt'
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [794, 1123],
        hotfixes: ['px_scaling']
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, 794, 1123);
    pdf.save(`doc-design-${Date.now()}.pdf`);
};

export const exportToWord = async (elements) => {
    const canvas = await captureElement('print-area');
    if (!canvas) {
        alert("Failed to generate Word doc. Please try again.");
        return;
    }

    const imgData = canvas.toDataURL('image/png');

    // Fetch blob from dataURL
    const response = await fetch(imgData);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    // Standard A4 in Word is approx 595 points width
    const wordWidth = 595;
    const wordHeight = 842;

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    },
                },
            },
            children: [
                new Paragraph({
                    children: [
                        new ImageRun({
                            data: arrayBuffer,
                            transformation: {
                                width: wordWidth,
                                height: wordHeight
                            }
                        })
                    ]
                })
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    saveAs(new Blob([buffer]), `design-${Date.now()}.docx`);
};
