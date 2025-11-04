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
    status?: 'pending' | 'completed' | 'failed';
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
}

export interface Banner {
    id: number;
    imageUrl: string;
    link: string;
}