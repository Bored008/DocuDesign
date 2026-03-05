import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import FAQ from './FAQ';
import Footer from './Footer';

const LandingPage = ({ onGoToEditor }) => {
    return (
        <div className="bg-black h-screen w-screen relative overflow-x-hidden overflow-y-auto text-white font-[Poppins,'Geist',sans-serif]">
            <div className="relative w-full overflow-hidden">
                {/* Background glow effects */}
                <div className="absolute rounded-full blur-[450px] z-0 pointer-events-none w-[1306px] h-[1306px] bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,1)_0%,rgba(40,104,220,1)_37%,rgba(0,21,58,1)_100%)] top-[-653px] left-[67px]"></div>
                <div className="absolute rounded-full blur-[450px] z-0 pointer-events-none w-[415px] h-[415px] bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,1)_0%,rgba(19,59,133,1)_37%,rgba(1,20,55,1)_100%)] top-[653px] left-[1233px]"></div>
                <div className="absolute rounded-full blur-[450px] z-0 pointer-events-none w-[415px] h-[415px] bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,1)_0%,rgba(19,59,133,1)_37%,rgba(1,20,55,1)_100%)] top-[2268px] left-[-182px]"></div>
                <div className="absolute rounded-full blur-[450px] z-0 pointer-events-none w-[2094px] h-[1732px] bg-[radial-gradient(circle_at_43%_87%,rgba(255,255,255,1)_0%,rgba(40,104,220,1)_18%,rgba(0,21,58,1)_100%)] top-[211px] left-[-814px]"></div>
                <div className="absolute rounded-full blur-[450px] z-0 pointer-events-none w-[2094px] h-[1732px] bg-[radial-gradient(circle_at_43%_87%,rgba(255,255,255,1)_0%,rgba(40,104,220,1)_18%,rgba(0,21,58,1)_100%)] top-[1770px] left-[258px]"></div>

                {/* Container for content */}
                <div className="max-w-[1440px] mx-auto relative min-h-screen z-10">
                    <Navbar onGoToEditor={onGoToEditor} />
                    <Hero onGoToEditor={onGoToEditor} />
                    <Features />
                    <FAQ />
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default LandingPage;
