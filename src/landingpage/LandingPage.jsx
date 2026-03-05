import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import FAQ from './FAQ';
import Footer from './Footer';
import './LandingPage.css';

const LandingPage = ({ onGoToEditor }) => {
    return (
        <div className="landing-page">
            <div className="landing-scroll-content">
                {/* Background glow effects */}
                <div className="bg-glow glow-1"></div>
                <div className="bg-glow glow-2"></div>
                <div className="bg-glow glow-3"></div>
                <div className="bg-glow glow-4"></div>
                <div className="bg-glow glow-5"></div>

                {/* Container for content */}
                <div className="landing-container">
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
