import { SiteConfig, Banner, CustomerServiceLink, PromoCode, SiteImages, WithdrawalSettings, PaymentInfo } from '../types';

const CONFIG_DB_KEY = 'refrigerators_config_db_v2';

const defaultConfig: SiteConfig = {
    withdrawalSettings: {
        is24Hour: false,
        startHour: 10,
        endHour: 18,
    },
    paymentInfo: {
        receiverWallet: '01206998667',
    },
    banners: [
        { id: '1', imageUrl: 'https://i.imgur.com/8i2D821.png', link: '/products' },
        { id: '2', imageUrl: 'https://i.imgur.com/fA2GRa1.png', link: '/team' },
        { id: '3', imageUrl: 'https://i.imgur.com/nOKx1gh.png', link: '/about-us' },
    ],
    customerServiceLinks: [
        { id: '1', name: 'Telegram', link: 'https://t.me/Refrigerator_support' },
        { id: '2', name: 'قناة التلجرام', link: 'https://t.me/ho2yJOgwggrxYWVi' },
    ],
    promoCodes: [
        { id: '1', code: 'DEPOSIT50', bonusAmount: 50, usesLeft: 100 },
        { id: '2', code: 'VIP200', bonusAmount: 200, usesLeft: 20 },
    ],
    siteImages: {
        homeHeader: 'https://i.imgur.com/aBcDeF1.png',
    },
    aboutUsContent: `
شركة رائدة في مجال التداول الكمي المدعم بالذكاء الاصطناعي، XTX متخصصة في تداول العملات الأجنبية (الفوركس) والعملات الرقمية. نستفيد من الذكاء الاصطناعي المتقدم لتحسين استراتيجيات التداول، ورفع كفاءة السوق، ومساعدة عملائنا على تحقيق عوائد استثمارية ممتازة، مما يتيح لعملائنا حول العالم الاستفادة من مزايا الخدمات المالية الذكية.

نوظف كفاءات موظفينا، وتقنيات الحوسبة الحديثة، والبنية التحتية لـ XTX في البنية المتطورة لتحليل مجموعات البيانات الضخمة في مختلف الأسواق بسرعة وكفاءة، بما يعزز فعالية خوارزميات التداول الخاصة بنا.

على مكانتها بين أفضل 5 مزودي سيولة من حيث حصة سوق XTX، حافظت منتجات الفوركس العالمية لخمس سنوات متتالية، وتالت أفضل مزودي تداول العملات الأجنبية الإلكتروني الفوري/الأجل لسبع سنوات متتالية (وفقًا لاستطلاع يوروموني السنوي). في عام 2023، كنا أيضًا ثالث أكبر مزود لخدمات التداول الكمي للعملات الرقمية عالميًا.

مكاتب في لندن، ونيويورك، وسنغافورة، وباريس، ومومباي، ويريفان، XTX لدى فكرة لخدمة العملاء العالميين وتحقيق عوائد استثمارية ممتازة من خلال تقنية التداول الخوارزمي المتقدمة المدعمة بالذكاء الاصطناعي. أينما كنت معك لتحقيق أهدافك المالية XTX.

بأكثر من 80 مليون جنيه إسترليني للجمعيات XTX منذ عام 2020، تبرعت الخيرية والقضايا الإنسانية، مما يجعلها من أبرز الجهات المانحة في المملكة المتحدة والعالم.
    `,
    platformRulesContent: `
هي شركة رائدة في مجال التداول الخوارزمي للعملات الأجنبية والعملات المشفرة باستخدام الذكاء الاصطناعي. نحن نستخدم الذكاء الاصطناعي المتقدم لتحسين استراتيجيات التداول، وتعزيز كفاءة السوق، ومساعدة العملاء في تحقيق عوائد استثمارية فائقة، مما يتيح للعملاء العالميين الاستفادة من الخدمات المالية الذكية.

عندما يقوم صديق قمت بدعوته بالتسجيل والاستثمار، ستحصل على الفور على مكافأة نقدية تعادل 35% من مبلغ استثماره.

عندما يستثمر أعضاء فريقك من المستوى 2، ستحصل على مكافأة نقدية بنسبة 2%.

عندما يستثمر أعضاء فريقك من المستوى 3، ستحصل على مكافأة نقدية بنسبة 1%.

بمجرد أن يستثمر أعضاء فريقك، ستضاف المكافآت النقدية على الفور إلى رصيد حسابك وستكون متاحة للسحب فورا.

1. استثمر 200 جنيه مصري، واسحب 100 جنيه مصري.
2. مكافأة التسجيل: 100 جنيه مصري. يمكن سحبها بعد الإيداع.
3. مكافأة تسجيل الدخول اليومية: 5 جنيهات مصرية.
4. قم بإحالة شركاء للاستثمار واحصل على مكافأة نقدية بنسبة 38% من مبلغ استثماراتهم.
5. يمكن أن تصل عوائد الاستثمار إلى 2100% - انضم الآن.
    `,
};

export const getConfig = (): SiteConfig => {
    try {
        const db = localStorage.getItem(CONFIG_DB_KEY);
        if (db) {
            const parsed = JSON.parse(db);
            // Deep merge to ensure new properties from defaultConfig are added
            // if they don't exist in the stored config.
            const mergedConfig: SiteConfig = {
                ...defaultConfig,
                ...parsed,
                withdrawalSettings: { ...defaultConfig.withdrawalSettings, ...parsed.withdrawalSettings },
                paymentInfo: { ...defaultConfig.paymentInfo, ...parsed.paymentInfo },
                siteImages: { ...defaultConfig.siteImages, ...parsed.siteImages }
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
