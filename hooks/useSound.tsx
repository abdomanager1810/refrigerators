import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

interface SoundContextType {
    isSoundEnabled: boolean;
    toggleSound: () => void;
}

export const SoundContext = createContext<SoundContextType | null>(null);

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
        try {
            const savedSoundSetting = localStorage.getItem('soundEnabled');
            // Default to true if no setting is found
            return savedSoundSetting ? JSON.parse(savedSoundSetting) : true; 
        } catch (error) {
            return true;
        }
    });

    useEffect(() => {
        localStorage.setItem('soundEnabled', JSON.stringify(isSoundEnabled));
    }, [isSoundEnabled]);

    const toggleSound = () => {
        setIsSoundEnabled(prev => !prev);
    };

    return (
        <SoundContext.Provider value={{ isSoundEnabled, toggleSound }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
};
