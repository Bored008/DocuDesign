import React from 'react';
import { LogIn } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onGoToEditor }) => {
    return (
        <nav className="navbar-container">
            <div className="navbar-bg"></div>
            <div className="navbar-content">
                <div className="navbar-brand">
                    DocDesign
                </div>

                <div className="navbar-links">
                    <div className="nav-item active-pill">
                        <div className="active-dot"></div>
                        <span>Home</span>
                    </div>
                    <a href="#about" className="nav-item">About</a>
                    <button onClick={onGoToEditor} className="nav-item bg-transparent border-none p-0 cursor-pointer">Create</button>
                </div>

                <button className="login-btn">
                    <LogIn size={18} color="#ffffff" strokeWidth={2.5} />
                    <span>Log in</span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
