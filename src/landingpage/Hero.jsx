import React from 'react';
import { PenTool } from 'lucide-react';
import staticImage from '../assets/static-image.png';
import editableDoc from '../assets/editable-document.png';

const Hero = ({ onGoToEditor }) => {
    return (
        <div className="w-[1260px] h-[1079.5px] mt-[32px] mx-auto relative flex flex-col items-center z-10">
            <h1 className="font-['Burbank_Big_Condensed','Impact',sans-serif] font-bold text-[112px] leading-[1em] text-center text-white mt-[59px] mb-0 w-[823px]">
                Make your Image<br />
                a Editable Document
            </h1>

            <p className="font-[Geist,'Poppins',sans-serif] font-medium text-base leading-[1.3] text-center text-white w-[679px] mt-[-3px]">
                A Website that can convert the image document into easy editable image wether it is a front page of project or resume details u want to edit for free .
            </p>

            <button onClick={onGoToEditor} className="flex flex-row justify-center items-center gap-[4px] py-[12px] px-[19px] mt-[24px] bg-white/3 hover:bg-white/10 border border-white rounded-lg text-white cursor-pointer font-[Geist,'Poppins',sans-serif] font-normal text-base leading-[1.3em]">
                <span>Edit your Doc</span>
                <PenTool size={16} />
            </button>

            <div className="relative w-[1053.5px] h-[629.5px] mt-[-12.5px]">

                <div className="static-side">
                    <div className="font-[Geist,'Poppins',sans-serif] font-bold text-[21.69px] leading-[1.3] text-center text-white absolute z-20 left-[280.68px] top-[30.6px] w-[145.85px]">Static Image</div>
                    <div className="absolute bg-white/10 border border-dashed border-white/30 rounded-lg overflow-hidden left-[170.73px] top-[62.36px] w-[359.19px] h-[433.39px] bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.01)_100%)]">
                        <img src={staticImage} alt="Static Document" className="w-full h-full object-cover block" />
                    </div>
                </div>

                <div className="graphic-center">
                    {/* Curved arrow placeholder */}
                    <div className="absolute left-[420.16px] top-0 w-[222.3px] h-[222.3px] z-30">
                        <svg width="222" height="222" viewBox="0 0 222 222" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.5 165.5C20.5 165.5 30.5 107.5 73 90C115.5 72.5 174 72 174 72" stroke="white" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8" />
                            <path d="M152 47L178 72L148 95" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <div className="editable-side">
                    <div className="font-[Geist,'Poppins',sans-serif] font-bold text-[21.69px] leading-[1.3] text-center text-white absolute z-20 left-[620.81px] top-[55.56px] w-[203.31px]">Editable Document</div>
                    <div className="absolute bg-white/10 border border-dashed border-white/30 rounded-lg overflow-hidden left-[506.36px] top-[87.74px] w-[407.78px] h-[493.74px] bg-[linear-gradient(135deg,rgba(30,30,80,0.4)_0%,rgba(10,10,30,0.6)_100%)] shadow-[0px_20px_50px_rgba(0,0,0,0.5)] z-10">
                        <img src={editableDoc} alt="Editable Document" className="w-full h-full object-cover block" />
                    </div>
                </div>

                {/* Blur Ellipse effect overlay for graphics */}
                <div className="absolute left-[-80px] top-[340.74px] w-[1210px] h-[288.76px] bg-transparent blur-[58.96px] z-40 pointer-events-none shadow-[inset_0px_50px_100px_-20px_#000000]"></div>
            </div>
        </div>
    );
};

export default Hero;
