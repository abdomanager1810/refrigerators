import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
    language: Language;
    t: (key: string) => string;
    toggleLanguage: () => void;
}

const translations = {
  ar: {
    // BottomNav
    home: 'بيت',
    product: 'المنتج',
    team: 'الفريق',
    my: 'خاصتي',
    // AccountPage
    accountBalance: 'رصيد الحساب',
    totalRevenue: 'إجمالي الإيرادات',
    profileInformation: 'معلومات الملف الشخصي',
    edit: 'تعديل',
    username: 'اسم المستخدم',
    email: 'البريد الإلكتروني',
    emailNotSet: 'لم يتم تعيين بريد إلكتروني',
    recharge: 'إعادة الشحن',
    withdraw: 'ينسحب',
    balanceRecord: 'سجل الرصيد',
    myDevices: 'أجهزتي',
    changePassword: 'تغيير كلمة المرور',
    twoFactorAuth: 'التحقق بخطوتين',
    active: 'نشط',
    inactive: 'غير نشط',
    adminPanel: 'لوحة التحكم للمسؤول',
    lastLogin: 'آخر تسجيل دخول',
    manageWallet: 'إدارة حساب المحفظة',
    help: 'مساعدة',
    refrigeratorRules: 'قواعد الثلاجات',
    aboutUs: 'معلومات عنا',
    logout: 'تسجيل الخروج',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
  },
  en: {
    // BottomNav
    home: 'Home',
    product: 'Product',
    team: 'Team',
    my: 'My',
    // AccountPage
    accountBalance: 'Account Balance',
    totalRevenue: 'Total Revenue',
    profileInformation: 'Profile Information',
    edit: 'Edit',
    username: 'Username',
    email: 'Email',
    emailNotSet: 'Email not set',
    recharge: 'Recharge',
    withdraw: 'Withdraw',
    balanceRecord: 'Balance Record',
    myDevices: 'My Devices',
    changePassword: 'Change Password',
    twoFactorAuth: 'Two-Factor Auth',
    active: 'Active',
    inactive: 'Inactive',
    adminPanel: 'Admin Panel',
    lastLogin: 'Last Login',
    manageWallet: 'Manage Wallet Account',
    help: 'Help',
    refrigeratorRules: 'Refrigerators Rules',
    aboutUs: 'About Us',
    logout: 'Log Out',
    language: 'Language',
    arabic: 'العربية',
    english: 'English',
  }
};

export const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        try {
            const savedLang = localStorage.getItem('language') as Language;
            return savedLang || 'ar';
        } catch {
            return 'ar';
        }
    });

    useEffect(() => {
        const root = document.documentElement;
        root.lang = language;
        root.dir = language === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('language', language);
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prev => (prev === 'ar' ? 'en' : 'ar'));
    };

    const t = (key: string): string => {
        const langDict = translations[language];
        // @ts-ignore
        return langDict[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
