import React from 'react';
import { LogIn } from 'lucide-react';
const Navbar = ({ onGoToEditor }) => {
    return (
        <nav className="w-[1260px] h-[71px] mt-[32px] mx-auto relative flex items-center rounded-lg bg-[#7E9BDF]/32">
            <div className="w-full px-8 flex items-center justify-between box-border z-10">
                <div className="font-['Mortend','Gilroy-Black',sans-serif] font-bold text-[32px] leading-[1.1] text-white">
                    DocDesign
                </div>

                <div className="flex absolute left-1/2 -translate-x-1/2 gap-8">
                    <div className="font-[Poppins,sans-serif] font-medium text-base leading-normal text-white no-underline cursor-pointer flex items-center bg-[#D9D9D9]/[0.29] border-[0.2px] border-white rounded-[38px] py-2 px-6 gap-2">
                        <div className="w-[5px] h-[5px] bg-white rounded-full"></div>
                        <span>Home</span>
                    </div>
                    <a href="#about" className="font-[Poppins,sans-serif] font-medium text-base leading-normal text-white no-underline cursor-pointer flex items-center">About</a>
                    <button onClick={onGoToEditor} className="font-[Poppins,sans-serif] font-medium text-base leading-normal text-white no-underline cursor-pointer flex items-center bg-transparent border-none p-0">Create</button>
                </div>

                <button className="flex items-center justify-center gap-[5px] py-[7px] px-[13px] bg-white/20 hover:bg-white/30 rounded-[33px] border-none cursor-pointer font-[Poppins,sans-serif] font-medium text-base leading-normal text-white transition-colors">
                    <LogIn size={18} color="#ffffff" strokeWidth={2.5} />
                    <span>Log in</span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
