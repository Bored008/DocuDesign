import React from 'react';

import featuresIcon from '../assets/features-icon.png';

const Features = () => {
    return (
        <div className="w-[1260px] h-[584px] my-[60px] mx-auto mt-[60px] mb-[140px] relative z-10">
            <div className="w-full h-full bg-[#7E9BDF]/20 rounded-[28px] relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">

                {/* V-Shape Envelope Background Graphic */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <svg width="1260" height="584" viewBox="0 0 1260 584" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0 L630 250 L1260 0 L1260 584 L0 584 Z" fill="rgba(126, 155, 223, 0.2)" />
                        <path d="M-5 -2 L630 250 L1265 -2" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                </div>

                <div className="flex flex-col items-center z-10 relative">
                    <img src={featuresIcon} alt="Features Icon" className="absolute w-[124px] h-[122px] left-[569px] top-[21px]" />
                    <h2 className="absolute w-[196px] h-[61px] left-[533px] top-[146px] font-['Gilroy-Black','Impact',sans-serif] text-[48px] font-normal text-center text-white m-0">Features</h2>
                </div>

                <div className="z-10 relative">
                    <div className="absolute text-white font-[Geist,'Poppins',sans-serif] left-[70px] top-[200px] w-[330px] h-[147px] text-left">
                        <h3 className="m-0 mb-3 font-semibold text-[32px] leading-[1.3]">Free to Use</h3>
                        <p className="m-0 font-normal text-[20px] leading-normal text-white/85">DocDesign is free to use which can run locally on ur system or on live server ,</p>
                    </div>

                    <div className="absolute text-white font-[Geist,'Poppins',sans-serif] left-[411px] top-[369px] w-[436px] h-[147px] text-center">
                        <h3 className="m-0 mb-3 font-semibold text-[32px] leading-[1.3]">Save Time</h3>
                        <p className="m-0 font-normal text-[20px] leading-normal text-white/85">DocDesign can be used at last moment instead of creating everything from scratch, just edit the details on the spot</p>
                    </div>

                    <div className="absolute text-white font-[Geist,'Poppins',sans-serif] left-[873px] top-[200px] w-[328px] h-[178px] text-left">
                        <h3 className="m-0 mb-3 font-semibold text-[32px] leading-[1.3]">LocalStorage</h3>
                        <p className="m-0 font-normal text-[20px] leading-normal text-white/85">Save ur document design locally as image, pdf, word usign export and use them anytime , anywhere</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Features;
