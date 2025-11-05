

import React from 'react';
import { BellIcon, SendIcon } from './icons';

interface WelcomeModalProps {
    onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-xl w-full max-w-sm text-gray-300 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center border-b border-gray-700">
                    <div className="w-20 h-20 bg-pink-500/20 rounded-full mx-auto flex items-center justify-center mb-4">
                        <BellIcon className="w-12 h-12 text-pink-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-100">إعلام</h2>
                </div>
                <div className="p-6 text-right text-sm leading-relaxed space-y-3">
                    <p>هي شركة رائدة في مجال التداول الخوارزمي للعملات XTX الأجنبية والعملات المشفرة باستخدام الذكاء الاصطناعي. نحن نستخدم الذكاء الاصطناعي المتقدم لتحسين استراتيجيات التداول، وتعزيز كفاءة السوق، ومساعدة العملاء في تحقيق عوائد استثمارية فائقة، مما يتيح للعملاء العالميين الاستفادة من الخدمات المالية الذكية.</p>
                    <p>1. استثمر 200 جنيه مصري، واسحب 100 جنيه مصري.</p>
                    <p>2. مكافأة التسجيل: 100 جنيه مصري.</p>
                    <p>3. مكافأة تسجيل الدخول اليومية: 3 جنيهات مصرية.</p>
                </div>
                <div className="p-4 space-y-2">
                     <a 
                        href="https://t.me/ho2yJOgwggrxYWVi" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full bg-blue-500 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                    >
                        <SendIcon className="w-5 h-5" />
                        <span>اضغط هنا للانضمام إلى القناة الرسمية على التليجرام</span>
                    </a>
                    <button 
                        onClick={onClose}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg"
                    >
                        نعم
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;