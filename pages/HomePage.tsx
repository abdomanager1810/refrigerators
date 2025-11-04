import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarIcon, HelpCircleIcon, UploadCloudIcon, DownloadCloudIcon, BellIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/icons';
import WelcomeModal from '../components/WelcomeModal';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../utils/toast';
import Spinner from '../components/Spinner';
import GlobalSalesTracker from '../components/GlobalSalesTracker';
import { useProducts } from '../hooks/useProducts';
import { useSiteData } from '../hooks/useSiteData';

const notificationTemplates = [
    "****{user} الودائع {amount}",
    "تهانينا لـ ****{user} على سحب {amount} جنيه",
    "مستخدم ****{user} قام للتو بشراء {product}",
    "قام ****{user} بدعوة صديق بنجاح وحصل على مكافأة",
    "مكافأة فريق جديدة من المستوى 1 للمستخدم ****{user}",
];
const productNames = ["ثلاجة Sharp", "iPhone 14", "Samsung S23", "AirPods Pro"];

const generateRandomNotification = () => {
    const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
    const user = Math.floor(1000 + Math.random() * 9000);
    const amount = [50, 100, 200, 500, 1000][Math.floor(Math.random() * 5)];
    const product = productNames[Math.floor(Math.random() * productNames.length)];
    return template.replace('{user}', user.toString()).replace('{amount}', amount.toString()).replace('{product}', product);
};

const TrophyIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);


interface Win {
    id: string;
    name: string;
    amount: number;
    timestamp: number;
}

const LatestWinsFeed: React.FC = () => {
    const [wins, setWins] = useState<Win[]>([]);
    const [now, setNow] = useState(Date.now());

    const generateNewWin = (): Win => ({
        id: crypto.randomUUID(),
        name: `****${Math.floor(1000 + Math.random() * 9000)}`,
        amount: Math.floor(100 + Math.random() * 4900),
        timestamp: Date.now(),
    });

    useEffect(() => {
        const initialWins: Win[] = [];
        for (let i = 0; i < 5; i++) {
            initialWins.push({
                ...generateNewWin(),
                timestamp: Date.now() - (i * 3500 + Math.random() * 2000)
            });
        }
        setWins(initialWins);

        const interval = setInterval(() => {
            setWins(prevWins => [generateNewWin(), ...prevWins.slice(0, 4)]);
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((now - timestamp) / 1000);
        if (seconds < 5) return 'الآن';
        if (seconds < 60) return `قبل ${seconds} ثانية`;
        return `قبل دقيقة`;
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 text-right">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-end">
                <span>أحدث المكاسب</span>
                 <span className="w-3 h-3 bg-green-400 rounded-full ml-2 animate-pulse"></span>
            </h3>
            <div className="space-y-2">
                {wins.map((win, index) => (
                    <div
                        key={win.id}
                        className={`flex items-center justify-between p-2 rounded-md transition-all duration-300 ${index === 0 ? 'animate-list-item-in bg-indigo-50' : 'bg-gray-50'}`}
                    >
                        <span className="text-xs text-gray-500 font-mono flex-shrink-0">{timeAgo(win.timestamp)}</span>
                        <div className="flex items-center text-right flex-grow justify-end">
                            <p className="text-sm text-gray-700">
                                المستخدم <span className="font-bold text-indigo-600">{win.name}</span> ربح <span className="font-bold text-green-600">{win.amount.toLocaleString()} جنيه</span>
                            </p>
                             <TrophyIcon className="w-5 h-5 text-yellow-500 mr-3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const RotatingBanners: React.FC = () => {
    const { banners } = useSiteData();
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (banners.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % banners.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [banners]);

    const goToPrevious = () => {
        if (banners.length === 0) return;
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? banners.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        if (banners.length === 0) return;
        const isLastSlide = currentIndex === banners.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const goToSlide = (slideIndex: number) => {
        setCurrentIndex(slideIndex);
    };
    
    if (banners.length === 0) {
        return <div className="relative w-full h-40 rounded-lg overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center"><p className="text-gray-500">لا توجد لافتات متاحة</p></div>
    }

    return (
        <div className="relative w-full h-40 rounded-lg overflow-hidden shadow-lg card-enter" style={{ animationDelay: '400ms' }}>
            <div className="w-full h-full relative">
                {banners.map((banner, index) => (
                    <Link to={banner.link} key={banner.id}>
                        <img
                            src={banner.imageUrl}
                            alt={`Banner ${banner.id}`}
                            className={`absolute w-full h-full object-cover transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0'}`}
                        />
                    </Link>
                ))}
            </div>
            <button onClick={goToPrevious} className="absolute top-1/2 -translate-y-1/2 left-2 z-20 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors">
                <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button onClick={goToNext} className="absolute top-1/2 -translate-y-1/2 right-2 z-20 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors">
                <ChevronRightIcon className="w-5 h-5" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                {banners.map((_, slideIndex) => (
                    <button key={slideIndex} onClick={() => goToSlide(slideIndex)} className={`w-2 h-2 rounded-full transition-colors ${currentIndex === slideIndex ? 'bg-white' : 'bg-white/50'}`}></button>
                ))}
            </div>
        </div>
    );
};

const TopEarningProducts: React.FC = () => {
    const { products } = useProducts();
    const [topProducts, setTopProducts] = useState<(typeof products[0])[]>([]);

    useEffect(() => {
        const updateTopProducts = () => {
            if (products.length > 0) {
                const shuffled = [...products].sort(() => 0.5 - Math.random());
                setTopProducts(shuffled.slice(0, 6));
            }
        };

        updateTopProducts();
        const interval = setInterval(updateTopProducts, 10000);
        return () => clearInterval(interval);
    }, [products]);

    if (topProducts.length === 0) return null;

    return (
         <div className="bg-white rounded-lg shadow p-4 text-right card-enter" style={{ animationDelay: '500ms' }}>
            <h3 className="font-bold text-gray-800 mb-3">🔥 أفضل المنتجات الرابحة اليوم</h3>
            <div className="flex overflow-x-auto space-x-4 space-x-reverse pb-3 -mx-2 px-2 no-scrollbar">
                {topProducts.map((product) => (
                    <Link to="/products" key={product.id} className="flex-shrink-0 w-40 block bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-all hover:shadow-md border border-transparent hover:border-indigo-200">
                        <div className="w-full h-24 bg-white rounded-md flex items-center justify-center p-2 mb-2">
                            <img src={product.iconUrl} alt={product.title} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-sm text-gray-800 truncate">{product.title}</p>
                            <p className="text-xs text-green-600 font-bold">+{product.dailyIncome.toFixed(2)} EGP / يوم</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

const HomePage: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const { dailyCheckIn, hasCheckedInToday } = useAuth();
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [notifications, setNotifications] = useState<string[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const hasSeenModal = sessionStorage.getItem('hasSeenWelcomeModal');
        if (!hasSeenModal) {
            setShowModal(true);
            sessionStorage.setItem('hasSeenWelcomeModal', 'true');
        }
        setIsCheckedIn(hasCheckedInToday());
    }, [hasCheckedInToday]);

    useEffect(() => {
        const generateNotifications = () => {
             const newNotifications = Array.from({ length: 5 }, generateRandomNotification);
             setNotifications(newNotifications);
        };
        generateNotifications();
        const interval = setInterval(generateNotifications, 8000);
        return () => clearInterval(interval);
    }, []);

    const handleCheckIn = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (isCheckedIn) {
            showToast('لقد قمت بتسجيل الوصول بالفعل اليوم.');
            return;
        }
        setIsCheckingIn(true);
        try {
            const message = await dailyCheckIn();
            showToast(message);
            setIsCheckedIn(true);
        } catch (error) {
            if (error instanceof Error) {
                showToast(error.message);
            }
        } finally {
            setIsCheckingIn(false);
        }
    };
    
    const ActionButton: React.FC<{label: string, icon: React.FC<any>, path?: string, onClick?: (e: React.MouseEvent) => void, disabled?: boolean, isLoading?: boolean}> = ({label, icon: Icon, path, onClick, disabled, isLoading}) => {
        const content = (
            <div className={`flex flex-col items-center transition-opacity ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className={`w-12 h-12 rounded-full ${disabled ? 'bg-gray-100' : 'bg-indigo-100'} flex items-center justify-center mb-2 shadow transition-transform duration-200 ease-in-out hover:scale-110`}>
                    {isLoading ? <Spinner size="sm" color="dark" /> : <Icon className={`w-6 h-6 ${disabled ? 'text-gray-400' : 'text-indigo-600'}`} />}
                </div>
                <span className="text-xs text-gray-700">{label}</span>
            </div>
        );

        if (path && !onClick) {
            return <Link to={path}>{content}</Link>
        }
        return <button onClick={onClick} disabled={disabled || isLoading} className="text-center">{content}</button>
    }


    const actions = [
        { label: 'إعادة الشحن', icon: UploadCloudIcon, path: '/recharge' },
        { label: 'ينسحب', icon: DownloadCloudIcon, path: '/withdraw' },
        { label: 'يساعد', icon: HelpCircleIcon, path: '/customer-service' },
    ];

    return (
        <div className="bg-gray-50">
            {showModal && <WelcomeModal onClose={() => setShowModal(false)} />}
            <header className="relative">
                 <img src="https://i.imgur.com/gKUM502.png" alt="Header Banner" className="w-full h-48 object-cover" />
            </header>
            
            <main className="p-4 -mt-4 relative z-10 space-y-6">
                
                {/* Notifications */}
                <div className="bg-white rounded-lg shadow p-2 flex items-center text-sm overflow-hidden card-enter">
                    <BellIcon className="text-indigo-500 w-5 h-5 ml-2 shrink-0" />
                    <div className="marquee-container w-full overflow-hidden">
                        <span className="marquee text-gray-600 whitespace-nowrap" key={notifications.join('')}>
                            {notifications.join('      ')}
                        </span>
                    </div>
                </div>
                
                {/* Actions */}
                <div className="grid grid-cols-4 gap-4 text-center card-enter" style={{ animationDelay: '100ms' }}>
                    {actions.map((action) => (
                        <ActionButton key={action.label} {...action} />
                    ))}
                     <ActionButton 
                        label={isCheckedIn ? 'تم التحقق' : 'تسجيل الوصول اليومي'} 
                        icon={CalendarIcon} 
                        onClick={handleCheckIn} 
                        disabled={isCheckedIn}
                        isLoading={isCheckingIn}
                    />
                </div>
                
                <div className="card-enter" style={{ animationDelay: '200ms' }}>
                    <LatestWinsFeed />
                </div>

                {/* New Global Sales Tracker */}
                <div className="card-enter" style={{ animationDelay: '300ms' }}>
                    <GlobalSalesTracker />
                </div>

                <RotatingBanners />

                <TopEarningProducts />
            </main>
        </div>
    );
};

export default HomePage;