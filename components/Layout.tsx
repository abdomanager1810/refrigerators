import React from 'react';
import BottomNav from './BottomNav';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="max-w-md mx-auto bg-white h-screen flex flex-col">
            <main className="flex-1 overflow-y-auto pb-20 page-fade-in">
                {children}
            </main>
            <BottomNav />
        </div>
    );
};

export default Layout;