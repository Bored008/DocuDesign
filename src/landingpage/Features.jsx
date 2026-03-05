import React from 'react';
import './Features.css';
import featuresIcon from '../assets/features-icon.png';

const Features = () => {
    return (
        <div className="features-container">
            <div className="features-bg">
                <div className="features-header flex flex-col items-center">
                    <img src={featuresIcon} alt="Features Icon" className="features-icon" />
                    <h2 className="features-title">Features</h2>
                </div>

                <div className="features-grid">
                    <div className="feature-item feature-left">
                        <h3>Free to Use</h3>
                        <p>DocDesign is free to use which can run locally on ur system or on live server ,</p>
                    </div>

                    <div className="feature-item feature-center">
                        <h3>Save Time</h3>
                        <p>DocDesign can be used at last moment instead of creating everything from scratch, just edit the details on the spot</p>
                    </div>

                    <div className="feature-item feature-right">
                        <h3>LocalStorage</h3>
                        <p>Save ur document design locally as image, pdf, word usign export and use them anytime , anywhere</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Features;
