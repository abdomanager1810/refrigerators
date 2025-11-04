import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Banner } from '../types';

const SITE_DATA_DB_KEY = 'refrigerators_sitedata_db';

const initialBanners: Banner[] = [
    { id: 1, imageUrl: 'https://i.imgur.com/8i2D821.png', link: '/products' },
    { id: 2, imageUrl: 'https://i.imgur.com/fA2GRa1.png', link: '/team' },
    { id: 3, imageUrl: 'https://i.imgur.com/nOKx1gh.png', link: '/about-us' },
];

interface SiteDataContextType {
    banners: Banner[];
    updateBanner: (banner: Banner) => void;
}

const getBanners = (): Banner[] => {
    try {
        const data = localStorage.getItem(SITE_DATA_DB_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            if (parsed.banners && parsed.banners.length > 0) return parsed.banners;
        }
        localStorage.setItem(SITE_DATA_DB_KEY, JSON.stringify({ banners: initialBanners }));
        return initialBanners;
    } catch {
        return initialBanners;
    }
};

const saveBanners = (banners: Banner[]) => {
    localStorage.setItem(SITE_DATA_DB_KEY, JSON.stringify({ banners }));
};

export const SiteDataContext = createContext<SiteDataContextType | null>(null);

export const SiteDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [banners, setBanners] = useState<Banner[]>(getBanners);

    const updateBanner = (updatedBanner: Banner) => {
        const newBanners = banners.map(b => b.id === updatedBanner.id ? updatedBanner : b);
        setBanners(newBanners);
        saveBanners(newBanners);
    };

    return (
        <SiteDataContext.Provider value={{ banners, updateBanner }}>
            {children}
        </SiteDataContext.Provider>
    );
};

export const useSiteData = () => {
    const context = useContext(SiteDataContext);
    if (!context) {
        throw new Error('useSiteData must be used within a SiteDataProvider');
    }
    return context;
};