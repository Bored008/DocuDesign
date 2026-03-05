import React from 'react';
import { PenTool } from 'lucide-react';
import './Hero.css';
import staticImage from '../assets/static-image.png';
import editableDoc from '../assets/editable-document.png';

const Hero = ({ onGoToEditor }) => {
    return (
        <div className="hero-container">
            <h1 className="hero-title">
                Make your Image<br />
                a Editable Document
            </h1>

            <p className="hero-subtitle">
                A Website that can convert the image document into easy editable image wether it is a front page of project or resume details u want to edit for free .
            </p>

            <button onClick={onGoToEditor} className="edit-doc-btn cursor-pointer">
                <span>Edit your Doc</span>
                <PenTool size={16} />
            </button>

            <div className="hero-graphics">

                <div className="graphic-side static-side">
                    <div className="graphic-label">Static Image</div>
                    <div className="image-placeholder left-placeholder">
                        <img src={staticImage} alt="Static Document" />
                    </div>
                </div>

                <div className="graphic-center">
                    {/* Curved arrow placeholder */}
                    <div className="curved-arrow">
                        <svg width="222" height="222" viewBox="0 0 222 222" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.5 165.5C20.5 165.5 30.5 107.5 73 90C115.5 72.5 174 72 174 72" stroke="white" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8" />
                            <path d="M152 47L178 72L148 95" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <div className="graphic-side editable-side">
                    <div className="graphic-label">Editable Document</div>
                    <div className="image-placeholder right-placeholder">
                        <img src={editableDoc} alt="Editable Document" />
                    </div>
                </div>

                {/* Blur Ellipse effect overlay for graphics */}
                <div className="graphic-blur-overlay"></div>
            </div>
        </div>
    );
};

export default Hero;
