export interface WithdrawalSettings {
    is24Hour: boolean;
    startHour: number; // 0-23
    endHour: number;   // 0-23
}

export interface PaymentInfo {
    receiverWallet: string;
}

export interface SiteConfig {
    withdrawalSettings: WithdrawalSettings;
    paymentInfo: PaymentInfo;
}

const CONFIG_DB_KEY = 'refrigerators_config_db';

const defaultConfig: SiteConfig = {
    withdrawalSettings: {
        is24Hour: false,
        startHour: 10,
        endHour: 18,
    },
    paymentInfo: {
        receiverWallet: '01206998667',
    },
};

export const getConfig = (): SiteConfig => {
    try {
        const db = localStorage.getItem(CONFIG_DB_KEY);
        if (db) {
            const parsed = JSON.parse(db);
            const mergedConfig = {
                withdrawalSettings: { ...defaultConfig.withdrawalSettings, ...parsed.withdrawalSettings },
                paymentInfo: { ...defaultConfig.paymentInfo, ...parsed.paymentInfo }
            };
            return mergedConfig;
        }
        localStorage.setItem(CONFIG_DB_KEY, JSON.stringify(defaultConfig));
        return defaultConfig;
    } catch {
        return defaultConfig;
    }
};

export const saveConfig = (config: SiteConfig) => {
    localStorage.setItem(CONFIG_DB_KEY, JSON.stringify(config));
};