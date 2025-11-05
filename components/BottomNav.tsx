import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { HomeIcon, DollarSignIcon, UsersIcon, UserCircleIcon } from './icons';
import { useLanguage } from '../hooks/useLanguage';

const BottomNav: React.FC = () => {
    const { currentUser } = useAuth();
    const { t } = useLanguage();
    const unreadCount = currentUser?.notifications?.filter(n => !n.read).length || 0;

    const navItems = [
        { path: '/', label: t('home'), icon: HomeIcon },
        { path: '/products', label: t('product'), icon: DollarSignIcon },
        { path: '/team', label: t('team'), icon: UsersIcon },
        { path: '/account', label: t('my'), icon: UserCircleIcon },
    ];

    const activeLinkClass = "text-indigo-400";
    const inactiveLinkClass = "text-gray-400";

    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gray-800 border-t border-gray-700 shadow-lg">
            <div className="flex justify-around h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end
                        className={({ isActive }) => 
                            `flex flex-col items-center justify-center w-1/4 text-xs ${isActive ? activeLinkClass : inactiveLinkClass}`
                        }
                    >
                        <div className="relative">
                            <item.icon className="w-6 h-6 mb-1" />
                            {item.path === '/account' && unreadCount > 0 && (
                                <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </div>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;