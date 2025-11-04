import { Product, ProductCategory } from '../types';

const VAlIDITY_DAYS = 60;

export const productCategories: ProductCategory[] = [
    { id: 1, name: 'ثلاجات', iconUrl: 'https://i.imgur.com/kDw2CJA.png' },
    { id: 2, name: 'أجهزة iPhone', iconUrl: 'https://i.imgur.com/sC52rQi.png' },
    { id: 3, name: 'أجهزة Samsung', iconUrl: 'https://i.imgur.com/kP1fRNo.png' },
    { id: 4, name: 'سماعات AirPods', iconUrl: 'https://i.imgur.com/I7W0T9w.png' },
    { id: 5, name: 'سماعات الرأس', iconUrl: 'https://i.imgur.com/Z4oV6Me.png' },
    { id: 6, name: 'غسالات', iconUrl: 'https://i.imgur.com/v8nC2gT.png' },
];

export const productsData: Product[] = [
    // Category 1: Refrigerators
    {
        id: 101, categoryId: 1, title: 'ثلاجة Sharp SJ-48C',
        description: 'ثلاجة شارب عالية الكفاءة مع تقنية نوفروست المتقدمة. مثالية للحفاظ على طعامك طازجًا لفترة أطول وتوفير استهلاك الطاقة. استثمارك في هذه الثلاجة يضمن دخلاً يوميًا ثابتًا.',
        price: 200, validity: VAlIDITY_DAYS, dailyIncome: 60,
        totalIncome: 60 * VAlIDITY_DAYS, totalQuantity: 50, soldCount: 5, updateTime: '10:00', purchaseLimit: 2,
        iconUrl: 'https://i.imgur.com/z1qjF7d.png',
    },
    {
        id: 102, categoryId: 1, title: 'ثلاجة Beko DNE50',
        description: 'ثلاجة بيكو بتصميم عصري وسعة تخزين كبيرة. توفر تبريدًا سريعًا ومتساويًا، مما يجعلها استثمارًا موثوقًا لتحقيق أرباح يومية مضمونة.',
        price: 600, validity: VAlIDITY_DAYS, dailyIncome: 140,
        totalIncome: 140 * VAlIDITY_DAYS, totalQuantity: 40, soldCount: 8, updateTime: '10:00', purchaseLimit: 2,
        iconUrl: 'https://i.imgur.com/3qV3Zf1.png',
    },
    {
        id: 103, categoryId: 1, title: 'ثلاجة LG GNM-C622',
        description: 'استثمر في ثلاجة LG الذكية واحصل على دخل يومي مرتفع. تتميز بتقنيات التبريد المبتكرة التي تحافظ على جودة الأطعمة وتزيد من أرباحك.',
        price: 1000, validity: VAlIDITY_DAYS, dailyIncome: 350,
        totalIncome: 350 * VAlIDITY_DAYS, totalQuantity: 30, soldCount: 3, updateTime: '10:00', purchaseLimit: 1,
        iconUrl: 'https://i.imgur.com/Y8XJ2gX.png',
    },
    {
        id: 104, categoryId: 1, title: 'ثلاجة Samsung RT46K',
        description: 'ثلاجة سامسونج Twin Cooling Plus تضمن لك دخلاً مستقرًا. بفضل تصميمها الأنيق وكفاءتها العالية في استهلاك الطاقة، تعد فرصة استثمارية ممتازة.',
        price: 1500, validity: VAlIDITY_DAYS, dailyIncome: 430,
        totalIncome: 430 * VAlIDITY_DAYS, totalQuantity: 20, soldCount: 2, updateTime: '10:00', purchaseLimit: 1,
        iconUrl: 'https://i.imgur.com/bA3E6aB.png',
    },
    {
        id: 105, categoryId: 1, title: 'ثلاجة Tornado RF-58T',
        description: 'اختر ثلاجة تورنيدو لتحقيق أقصى استفادة من استثمارك. تصميم متين وأداء موثوق يضمنان لك تدفقًا نقديًا يوميًا.',
        price: 2000, validity: VAlIDITY_DAYS, dailyIncome: 600,
        totalIncome: 600 * VAlIDITY_DAYS, totalQuantity: 15, soldCount: 1, updateTime: '10:00', purchaseLimit: 1,
        iconUrl: 'https://i.imgur.com/rG7P8Oq.png',
    },
     {
        id: 106, categoryId: 1, title: 'ثلاجة Hisense RS670',
        description: 'ثلاجة هايسنس بسعة ضخمة وتقنيات تبريد متقدمة، وهي فرصة استثمارية قوية تضمن لك عوائد يومية كبيرة.',
        price: 12000, validity: VAlIDITY_DAYS, dailyIncome: 400,
        totalIncome: 400 * VAlIDITY_DAYS, totalQuantity: 10, soldCount: 0, updateTime: '10:00', purchaseLimit: 1,
        iconUrl: 'https://i.imgur.com/R38ps6N.png',
    },

    // Category 2: iPhones
    {
        id: 201, categoryId: 2, title: 'iPhone 13',
        description: 'استثمر في iPhone 13، أحد أكثر الهواتف شعبية في العالم. يضمن لك هذا الاستثمار دخلاً ثابتًا بفضل الطلب المرتفع عليه.',
        price: 15000, validity: VAlIDITY_DAYS, dailyIncome: 500,
        totalIncome: 500 * VAlIDITY_DAYS, totalQuantity: 30, soldCount: 6, updateTime: '11:00', purchaseLimit: 1,
        iconUrl: 'https://i.imgur.com/gK9pA6s.png',
    },
    {
        id: 202, categoryId: 2, title: 'iPhone 13 Pro',
        description: 'هاتف iPhone 13 Pro هو استثمار ممتاز بفضل كاميراته المتقدمة وأدائه الفائق. احصل على أرباح يومية مجزية.',
        price: 20000, validity: VAlIDITY_DAYS, dailyIncome: 680,
        totalIncome: 680 * VAlIDITY_DAYS, totalQuantity: 25, soldCount: 5, updateTime: '11:00', purchaseLimit: 1,
        iconUrl: 'https://i.imgur.com/Dq4w4jT.png',
    },
    {
        id: 203, categoryId: 2, title: 'iPhone 14',
        description: 'يعتبر iPhone 14 من أحدث إصدارات Apple، مما يجعله فرصة استثمارية رائعة تضمن لك عوائد يومية عالية.',
        price: 25000, validity: VAlIDITY_DAYS, dailyIncome: 850,
        totalIncome: 850 * VAlIDITY_DAYS, totalQuantity: 20, soldCount: 4, updateTime: '11:00', purchaseLimit: 1,
        iconUrl: 'https://i.imgur.com/QYKOhYc.png',
    },
    {
        id: 204, categoryId: 2, title: 'iPhone 14 Pro Max',
        description: 'استثمارك في iPhone 14 Pro Max يضمن لك أعلى العوائد اليومية بفضل تقنياته المتطورة وشعبيته الكبيرة.',
        price: 35000, validity: VAlIDITY_DAYS, dailyIncome: 1200,
        totalIncome: 1200 * VAlIDITY_DAYS, totalQuantity: 15, soldCount: 3, updateTime: '11:00', purchaseLimit: 1,
        iconUrl: 'https://i.imgur.com/uR25Q67.png',
    },
    {
        id: 205, categoryId: 2, title: 'iPhone SE',
        description: 'هاتف iPhone SE هو استثمار اقتصادي وفعال. يجمع بين أداء Apple القوي وسعر مناسب، مما يضمن دخلاً جيدًا.',
        price: 8000, validity: VAlIDITY_DAYS, dailyIncome: 260,
        totalIncome: 260 * VAlIDITY_DAYS, totalQuantity: 40, soldCount: 10, updateTime: '11:00', purchaseLimit: 2,
        iconUrl: 'https://i.imgur.com/u4LaSAJ.png',
    },

    // Category 3: Samsung
    {
        id: 301, categoryId: 3, title: 'Samsung Galaxy S22',
        description: 'هاتف Samsung Galaxy S22 بتصميمه الأنيق وكاميرته القوية هو فرصة استثمارية لا تفوت لتحقيق دخل يومي مستمر.',
        price: 13000, validity: VAlIDITY_DAYS, dailyIncome: 430,
        totalIncome: 430 * VAlIDITY_DAYS, totalQuantity: 30, soldCount: 3, updateTime: '12:00', purchaseLimit: 1,
        iconUrl: 'https://i.imgur.com/dSNgV17.png',
    },
    {
        id: 302, categoryId: 3, title: 'Samsung Galaxy S23 Ultra',
        description: 'يعد Samsung Galaxy S23 Ultra قمة تكنولوجيا الهواتف الذكية، واستثمارك فيه يعني أرباحًا يومية استثنائية.',
        price: 28000, validity: VAlIDITY_DAYS, dailyIncome: 950,
        totalIncome: 950 * VAlIDITY_DAYS, totalQuantity: 20, soldCount: 2, updateTime: '12:00', purchaseLimit: 1,
        iconUrl: 'https://i.imgur.com/V9Xm1fA.png',
    },
    {
        id: 303, categoryId: 3, title: 'Samsung Galaxy Z Fold 4',
        description: 'استثمر في مستقبل الهواتف القابلة للطي مع Samsung Galaxy Z Fold 4. فرصة فريدة لتحقيق عوائد يومية عالية.',
        price: 32000, validity: VAlIDITY_DAYS, dailyIncome: 1100,
        totalIncome: 1100 * VAlIDITY_DAYS, totalQuantity: 15, soldCount: 1, updateTime: '12:00', purchaseLimit: 1,
        iconUrl: 'https://i.imgur.com/5uLqFvC.png',
    },
    {
        id: 304, categoryId: 3, title: 'Samsung Galaxy A54',
        description: 'هاتف Samsung Galaxy A54 يقدم قيمة ممتازة مقابل السعر، مما يجعله استثمارًا آمنًا ومربحًا على المدى الطويل.',
        price: 7000, validity: VAlIDITY_DAYS, dailyIncome: 230,
        totalIncome: 230 * VAlIDITY_DAYS, totalQuantity: 50, soldCount: 10, updateTime: '12:00', purchaseLimit: 2,
        iconUrl: 'https://i.imgur.com/6X9mAYV.png',
    },
    {
        id: 305, categoryId: 3, title: 'Samsung Galaxy M33',
        description: 'يتميز Samsung Galaxy M33 ببطاريته الضخمة وأدائه الموثوق، وهو خيار استثماري ذكي لتحقيق دخل يومي جيد.',
        price: 5000, validity: VAlIDITY_DAYS, dailyIncome: 160,
        totalIncome: 160 * VAlIDITY_DAYS, totalQuantity: 60, soldCount: 12, updateTime: '12:00', purchaseLimit: 3,
        iconUrl: 'https://i.imgur.com/jI8N2b8.png',
    },
    
    // Category 4: AirPods
    {
        id: 401, categoryId: 4, title: 'Apple AirPods (2nd Gen)',
        description: 'سماعات AirPods من الجيل الثاني هي استثمار شائع وموثوق. احصل على دخل يومي من أحد أكثر الملحقات مبيعًا في العالم.',
        price: 2500, validity: VAlIDITY_DAYS, dailyIncome: 80,
        totalIncome: 80 * VAlIDITY_DAYS, totalQuantity: 80, soldCount: 20, updateTime: '13:00', purchaseLimit: 3,
        iconUrl: 'https://i.imgur.com/h5rD5kY.png',
    },
    {
        id: 402, categoryId: 4, title: 'Apple AirPods (3rd Gen)',
        description: 'استثمر في الجيل الثالث من AirPods مع ميزات الصوت المكاني. فرصة رائعة لتحقيق أرباح يومية متزايدة.',
        price: 3500, validity: VAlIDITY_DAYS, dailyIncome: 115,
        totalIncome: 115 * VAlIDITY_DAYS, totalQuantity: 70, soldCount: 15, updateTime: '13:00', purchaseLimit: 2,
        iconUrl: 'https://i.imgur.com/lAjFcfb.png',
    },
    {
        id: 403, categoryId: 4, title: 'Apple AirPods Pro',
        description: 'تعتبر AirPods Pro استثمارًا ممتازًا بفضل ميزة إلغاء الضوضاء وجودة الصوت الفائقة. اضمن دخلاً يوميًا مرتفعًا.',
        price: 5000, validity: VAlIDITY_DAYS, dailyIncome: 165,
        totalIncome: 165 * VAlIDITY_DAYS, totalQuantity: 60, soldCount: 10, updateTime: '13:00', purchaseLimit: 2,
        iconUrl: 'https://i.imgur.com/VejKA3y.png',
    },
    {
        id: 404, categoryId: 4, title: 'Apple AirPods Max',
        description: 'استثمار فاخر في AirPods Max يضمن لك أعلى العوائد اليومية في فئة سماعات الرأس بفضل جودتها الاستثنائية.',
        price: 11000, validity: VAlIDITY_DAYS, dailyIncome: 360,
        totalIncome: 360 * VAlIDITY_DAYS, totalQuantity: 30, soldCount: 5, updateTime: '13:00', purchaseLimit: 1,
        iconUrl: 'https://i.imgur.com/Hq8GqYY.png',
    },
    {
        id: 405, categoryId: 4, title: 'Beats Fit Pro',
        description: 'سماعات Beats Fit Pro تجمع بين تصميم Apple وأداء Beats القوي، مما يجعلها فرصة استثمارية جذابة ومربحة.',
        price: 4000, validity: VAlIDITY_DAYS, dailyIncome: 130,
        totalIncome: 130 * VAlIDITY_DAYS, totalQuantity: 50, soldCount: 8, updateTime: '13:00', purchaseLimit: 2,
        iconUrl: 'https://i.imgur.com/pA3F7g3.png',
    },
    
    // Category 5: Headphones
    {
        id: 501, categoryId: 5, title: 'Sony WH-1000XM5',
        description: 'تعتبر سماعات Sony WH-1000XM5 الأفضل في فئتها لإلغاء الضوضاء، وهي استثمار يضمن لك أرباحًا يومية ممتازة.',
        price: 8000, validity: VAlIDITY_DAYS, dailyIncome: 265,
        totalIncome: 265 * VAlIDITY_DAYS, totalQuantity: 40, soldCount: 4, updateTime: '14:00', purchaseLimit: 1,
        iconUrl: 'https://i.imgur.com/f9GDS66.png',
    },
    {
        id: 502, categoryId: 5, title: 'Bose QuietComfort 45',
        description: 'استثمر في راحة وجودة صوت Bose QuietComfort 45. فرصة رائعة لتحقيق دخل يومي مستقر من علامة تجارية موثوقة.',
        price: 7000, validity: VAlIDITY_DAYS, dailyIncome: 230,
        totalIncome: 230 * VAlIDITY_DAYS, totalQuantity: 45, soldCount: 5, updateTime: '14:00', purchaseLimit: 1,
        iconUrl: 'https://i.imgur.com/J33CR1j.png',
    },
    {
        id: 503, categoryId: 5, title: 'Sennheiser Momentum 4',
        description: 'سماعات Sennheiser Momentum 4 تقدم جودة صوت استثنائية وعمر بطارية طويل، مما يجعلها استثمارًا ذكيًا ومربحًا.',
        price: 7500, validity: VAlIDITY_DAYS, dailyIncome: 250,
        totalIncome: 250 * VAlIDITY_DAYS, totalQuantity: 40, soldCount: 3, updateTime: '14:00', purchaseLimit: 1,
        iconUrl: 'https://i.imgur.com/1B9kZz1.png',
    },
    {
        id: 504, categoryId: 5, title: 'Anker Soundcore Life Q30',
        description: 'استثمار اقتصادي في Anker Soundcore Life Q30 يوفر قيمة كبيرة ودخلاً يوميًا جيدًا بفضل شعبيتها الواسعة.',
        price: 1500, validity: VAlIDITY_DAYS, dailyIncome: 50,
        totalIncome: 50 * VAlIDITY_DAYS, totalQuantity: 100, soldCount: 25, updateTime: '14:00', purchaseLimit: 4,
        iconUrl: 'https://i.imgur.com/y4L2k8p.png',
    },
    {
        id: 505, categoryId: 5, title: 'JBL Tune 760NC',
        description: 'سماعات JBL Tune 760NC هي خيار استثماري موثوق يجمع بين اسم JBL المعروف وسعر تنافسي لتحقيق أرباح جيدة.',
        price: 1800, validity: VAlIDITY_DAYS, dailyIncome: 60,
        totalIncome: 60 * VAlIDITY_DAYS, totalQuantity: 90, soldCount: 20, updateTime: '14:00', purchaseLimit: 3,
        iconUrl: 'https://i.imgur.com/G2xX1hF.png',
    },
    
    // Category 6: Washing Machines
    {
        id: 601, categoryId: 6, title: 'LG Vivace 9KG',
        description: 'استثمر في غسالة LG Vivace الذكية التي تعمل بالبخار. تكنولوجيا متقدمة تضمن لك دخلاً يوميًا مرتفعًا ومستقرًا.',
        price: 9000, validity: VAlIDITY_DAYS, dailyIncome: 300,
        totalIncome: 300 * VAlIDITY_DAYS, totalQuantity: 30, soldCount: 3, updateTime: '15:00', purchaseLimit: 1,
        iconUrl: 'https://i.imgur.com/t3x3E71.png',
    },
    {
        id: 602, categoryId: 6, title: 'Samsung 8KG WW80T',
        description: 'غسالة سامسونج بتقنية EcoBubble هي استثمار فعال وموفر للطاقة يضمن لك أرباحًا يومية جيدة.',
        price: 8500, validity: VAlIDITY_DAYS, dailyIncome: 280,
        totalIncome: 280 * VAlIDITY_DAYS, totalQuantity: 35, soldCount: 4, updateTime: '15:00', purchaseLimit: 1,
        iconUrl: 'https://i.imgur.com/n1h41a5.png',
    },
    {
        id: 603, categoryId: 6, title: 'Beko 7KG WTV7512',
        description: 'استثمار موثوق في غسالة بيكو التي تتميز ببرامجها المتعددة وكفاءتها العالية. احصل على دخل يومي ثابت.',
        price: 6500, validity: VAlIDITY_DAYS, dailyIncome: 215,
        totalIncome: 215 * VAlIDITY_DAYS, totalQuantity: 40, soldCount: 5, updateTime: '15:00', purchaseLimit: 2,
        iconUrl: 'https://i.imgur.com/O6L8X4U.png',
    },
    {
        id: 604, categoryId: 6, title: 'Sharp 7KG ES-FP710',
        description: 'غسالة شارب هي خيار استثماري اقتصادي وفعال. تضمن لك أداءً موثوقًا وعائدًا يوميًا جيدًا على استثمارك.',
        price: 5500, validity: VAlIDITY_DAYS, dailyIncome: 180,
        totalIncome: 180 * VAlIDITY_DAYS, totalQuantity: 50, soldCount: 8, updateTime: '15:00', purchaseLimit: 2,
        iconUrl: 'https://i.imgur.com/V7RjY4r.png',
    },
    {
        id: 605, categoryId: 6, title: 'Zanussi 10KG ZWF014',
        description: 'استثمر في غسالة زانوسي ذات السعة الكبيرة. مثالية للعائلات الكبيرة، وتضمن لك دخلاً يوميًا مرتفعًا ومستمرًا.',
        price: 11000, validity: VAlIDITY_DAYS, dailyIncome: 365,
        totalIncome: 365 * VAlIDITY_DAYS, totalQuantity: 25, soldCount: 2, updateTime: '15:00', purchaseLimit: 1,
        iconUrl: 'https://i.imgur.com/3Z6z7O9.png',
    },
];