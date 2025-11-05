import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { SiteConfig } from '../types';
import * as configDb from '../data/configDb';

interface SiteConfigContextType {
    config: SiteConfig;
    updateConfig: (newConfig: SiteConfig) => void;
}

export const SiteConfigContext = createContext<SiteConfigContextType | null>(null);

export const SiteConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<SiteConfig>(configDb.getConfig());

    const updateConfig = (newConfig: SiteConfig) => {
        configDb.saveConfig(newConfig);
        setConfig(newConfig);
    };

    return (
        <SiteConfigContext.Provider value={{ config, updateConfig }}>
            {children}
        </SiteConfigContext.Provider>
    );
};

export const useSiteConfig = () => {
    const context = useContext(SiteConfigContext);
    if (!context) {
        throw new Error('useSiteConfig must be used within a SiteConfigProvider');
    }
    return context;
};
