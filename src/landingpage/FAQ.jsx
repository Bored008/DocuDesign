import React, { useState } from 'react';

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
        <div className="w-[1260px] mx-auto mb-[120px] flex justify-between items-start text-white relative z-10">
            <div className="w-[410px] flex flex-col">
                <div className="flex items-center relative h-[100px]">
                    <h2 className="font-['Gilroy-Black','Impact',sans-serif] font-normal text-[48px] leading-[1.26] m-0 w-[319px]">Got Questions</h2>
                    <img src={questionMark} alt="Question Mark" className="absolute w-[100px] h-[100px] right-[-9px] top-0 object-contain" />
                </div>
                <p className="mt-[10px] font-[Geist,'Poppins',sans-serif] font-normal text-[24px] leading-[1.65] text-white/78">
                    Here are some common questions along with their answers to help clear up any confusion.
                </p>
            </div>

            <div className="w-[804px] flex flex-col gap-[24px]">
                {faqData.map((faq) => (
                    <div
                        key={faq.id}
                        className={`bg-[#C7D2ED]/35 rounded-[11px] shadow-[0px_5px_4px_0px_rgba(255,255,255,0.45)] px-[13px] pt-[12px] transition-all duration-300 ease-in-out cursor-pointer overflow-hidden ${openId === faq.id ? 'pb-[12px]' : 'pb-[12px]'}`}
                        onClick={() => toggleFaq(faq.id)}
                    >
                        <div className="flex justify-between items-center min-h-[40px]">
                            <span className="font-[Geist,'Poppins',sans-serif] font-normal text-[24px] leading-[1.65] m-0">{faq.question}</span>
                            <img
                                src={expandArrow}
                                alt="Expand"
                                className={`w-[30px] h-[30px] object-contain transition-transform duration-300 ease-in-out ${openId === faq.id ? 'rotate-180' : ''}`}
                            />
                        </div>
                        {openId === faq.id && (
                            <div className="mt-[4px] w-[630.54px]">
                                <p className="font-[Geist,'Poppins',sans-serif] font-normal text-[20px] leading-[1.65] text-white/75 m-0">{faq.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
