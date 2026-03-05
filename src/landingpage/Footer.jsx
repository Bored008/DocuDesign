import React from 'react';
import './Footer.css';
import telegramIcon from '../assets/telegram.png';
import githubIcon from '../assets/github.png';
import linkedinIcon from '../assets/linkedin.png';
import twitterIcon from '../assets/x-twitter.png';
import copyrightIcon from '../assets/copyright.png';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="footer-links">
                    <span className="footer-link">Home</span>
                    <span className="footer-link">Create</span>
                    <span className="footer-link">Contact</span>
                </div>

                <div className="footer-brand">
                    <h1 className="footer-logo">DocDesign</h1>
                </div>

                <div className="footer-socials">
                    <a href="#" className="social-icon"><img src={telegramIcon} alt="Telegram" /></a>
                    <a href="#" className="social-icon"><img src={githubIcon} alt="GitHub" /></a>
                    <a href="#" className="social-icon"><img src={linkedinIcon} alt="LinkedIn" /></a>
                    <a href="#" className="social-icon"><img src={twitterIcon} alt="X (Twitter)" /></a>
                </div>

                {/* Absolute overlay over the bottom to match "2026 DocDesign" row */}
                <div className="footer-copyright-row">
                    <img src={copyrightIcon} alt="Copyright" className="copyright-icon" />
                    <span className="copyright-text">2026 DocDesign. All rights reserved</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
