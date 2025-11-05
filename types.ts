export interface ProductCategory {
    id: number;
    name: string;
    iconUrl: string;
}

export interface Product {
    id: number;
    categoryId: number;
    title: string;
    description: string;
    price: number;
    validity: number; // in days
    dailyIncome: number;
    totalIncome: number;
    totalQuantity: number;
    soldCount: number;
    updateTime: string;
    purchaseLimit: number;
    iconUrl: string;
}

export interface PurchasedProduct {
    id: string;
    productId: number;
    purchaseDate: number; // timestamp
}

export interface Transaction {
    id: string;
    type: 'reward' | 'recharge' | 'purchase' | 'income' | 'withdraw' | 'sell';
    description: string;
    amount: number; // Positive for income, negative for expenses
    timestamp: number;
    purchasedProductId?: string; // Link income to a specific purchased product
    status?: 'pending' | 'completed' | 'rejected';
    senderWallet?: string; // Wallet user sent deposit from
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
}

export type WalletType = 'Vodafone Cash' | 'Orange Cash' | 'Etisalat Cash' | 'WE Pay' | 'InstaPay';

export interface WithdrawalWallet {
    walletType: WalletType;
    ownerName: string;
    walletNumber: string;
}

export interface User {
    phone: string;
    password: string; // In a real app, this would be a hash
    email?: string;
    inviteCode: string;
    balance: number;
    totalRevenue: number;
    transactions: Transaction[];
    purchasedProducts: PurchasedProduct[];
    notifications: Notification[];
    lastLogin: number; // timestamp
    lastCheckIn?: number; // timestamp for daily check-in
    withdrawalWallet?: WithdrawalWallet;
    withdrawalPassword?: string;
    
    // Referral System Fields
    referrer?: string; // phone number of the referrer
    team: {
        lv1: string[]; // array of phone numbers
        lv2: string[];
        lv3: string[];
    };
    teamBonuses: {
        lv1: number;
        lv2: number;
        lv3: number;
    };

    // Two-Factor Authentication
    isTwoFactorEnabled?: boolean;
    twoFactorSecret?: string;

    commissionRates?: {
        lv1: number;
        lv2: number;
        lv3: number;
    };
    isBlocked?: boolean;
    registrationInviteCode?: string;
}

export interface Banner {
    id: string;
    imageUrl: string;
    link: string;
}

export interface CustomerServiceLink {
    id: string;
    name: string;
    link: string;
}

export interface PromoCode {
    id: string;
    code: string;
    bonusAmount: number;
    usesLeft: number;
}

export interface WithdrawalSettings {
    is24Hour: boolean;
    startHour: number; // 0-23
    endHour: number;   // 0-23
}

export interface PaymentInfo {
    receiverWallet: string;
}

export interface SiteImages {
    homeHeader: string;
}

export interface SiteConfig {
    withdrawalSettings: WithdrawalSettings;
    paymentInfo: PaymentInfo;
    banners: Banner[];
    customerServiceLinks: CustomerServiceLink[];
    promoCodes: PromoCode[];
    siteImages: SiteImages;
    aboutUsContent: string;
    platformRulesContent: string;
}

// AI Chat Types
export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    image?: string; // base64 encoded image
    timestamp: number;
}

export interface ChatSession {
    id: string; // user phone number
    language: 'ar' | 'en';
    messages: ChatMessage[];
    isClosed: boolean;
    lastUpdated: number;
}