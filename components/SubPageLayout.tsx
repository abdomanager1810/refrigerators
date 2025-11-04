
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from './icons';

interface SubPageLayoutProps {
    title: string;
    children: React.ReactNode;
}

const SubPageLayout: React.FC<SubPageLayoutProps> = ({ title, children }) => {
    const navigate = useNavigate();

    return (
        <div className="max-w-md mx-auto bg-gray-100 min-h-screen">
            <header className="bg-gradient-to-b from-indigo-400 to-indigo-600 text-white h-14 flex items-center justify-between px-4 sticky top-0 z-20 shadow-md">
                <button onClick={() => navigate(-1)} className="p-2">
                    <ChevronLeftIcon className="w-6 h-6 transform scale-x-[-1]" />
                </button>
                <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">{title}</h1>
                <div />
            </header>
            <main>
                {children}
            </main>
        </div>
    );
};

export default SubPageLayout;