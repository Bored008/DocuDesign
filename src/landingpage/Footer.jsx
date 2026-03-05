import React from 'react';

import telegramIcon from '../assets/telegram.png';
import githubIcon from '../assets/github.png';
import linkedinIcon from '../assets/linkedin.png';
import twitterIcon from '../assets/x-twitter.png';
import copyrightIcon from '../assets/copyright.png';

const Footer = () => {
    return (
        <footer className="w-full h-[123px] bg-white relative mt-[80px]">
            <div className="w-[1260px] h-full mx-auto relative">
                <div className="absolute left-[10px] top-[34px] flex gap-[12px]">
                    <span className="font-[Geist,'Poppins',sans-serif] font-normal text-[15px] leading-[1.65] text-black/75 cursor-pointer">Home</span>
                    <span className="font-[Geist,'Poppins',sans-serif] font-normal text-[15px] leading-[1.65] text-black/75 cursor-pointer">Create</span>
                    <span className="font-[Geist,'Poppins',sans-serif] font-normal text-[15px] leading-[1.65] text-black/75 cursor-pointer">Contact</span>
                </div>

                <div>
                    <h1 className="absolute font-['Qasira','Gilroy-Black',sans-serif] font-normal text-[64px] leading-[0.95] text-black w-full text-center top-[20px] m-0">DocDesign</h1>
                </div>

                <div className="absolute right-[10px] top-[31px] flex gap-[8px] flex-row-reverse">
                    <a href="#" className="flex items-center justify-center"><img src={telegramIcon} alt="Telegram" className="w-[32px] h-[32px] object-contain" /></a>
                    <a href="#" className="flex items-center justify-center"><img src={githubIcon} alt="GitHub" className="w-[32px] h-[32px] object-contain" /></a>
                    <a href="#" className="flex items-center justify-center"><img src={linkedinIcon} alt="LinkedIn" className="w-[32px] h-[32px] object-contain" /></a>
                    <a href="#" className="flex items-center justify-center"><img src={twitterIcon} alt="X (Twitter)" className="w-[32px] h-[32px] object-contain" /></a>
                </div>

                {/* Absolute overlay over the bottom to match "2026 DocDesign" row */}
                <div className="absolute left-1/2 -translate-x-1/2 top-[87px] flex text-center gap-[5px]">
                    <img src={copyrightIcon} alt="Copyright" className="w-[22.43px] h-[24px] object-contain" />
                    <span className="font-[Geist,'Poppins',sans-serif] font-normal text-[15px] leading-[1.65] text-black/75">2026 DocDesign. All rights reserved</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
