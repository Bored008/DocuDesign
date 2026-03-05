import React, { useState } from 'react';
import './FAQ.css';
import questionMark from '../assets/question-mark.png';
import expandArrow from '../assets/expand-arrow.png';

const faqData = [
    {
        id: 1,
        question: "Can we download the image after editing the details ?",
        answer: "Yes , U can download the file using export button as image, pdf or word file ."
    },
    {
        id: 2,
        question: "Will my data be saved on the server ?",
        answer: "No, all data is stored locally in your browser's localStorage ensuring your privacy."
    },
    {
        id: 3,
        question: "Can I use it locally on my computer ?",
        answer: "Yes! DocDesign can be run entirely in your local environment without internet access."
    },
    {
        id: 4,
        question: "Do I need any skill of any sort ?",
        answer: "Not at all, the platform is designed to be intuitive and easy for anyone to edit documents on the spot."
    }
];

const FAQ = () => {
    const [openId, setOpenId] = useState(1);

    const toggleFaq = (id) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className="faq-container">
            <div className="faq-left">
                <div className="faq-header-container">
                    <h2 className="faq-title">Got Questions</h2>
                    <img src={questionMark} alt="Question Mark" className="faq-question-icon" />
                </div>
                <p className="faq-subtitle">
                    Here are some common questions along with their answers to help clear up any confusion.
                </p>
            </div>

            <div className="faq-right">
                {faqData.map((faq) => (
                    <div
                        key={faq.id}
                        className={`faq-item ${openId === faq.id ? 'faq-item-open' : ''}`}
                        onClick={() => toggleFaq(faq.id)}
                    >
                        <div className="faq-item-header">
                            <span className="faq-question-text">{faq.question}</span>
                            <img
                                src={expandArrow}
                                alt="Expand"
                                className={`faq-expand-icon ${openId === faq.id ? 'rotated' : ''}`}
                            />
                        </div>
                        {openId === faq.id && (
                            <div className="faq-item-body">
                                <p className="faq-answer-text">{faq.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
