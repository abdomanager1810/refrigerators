import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, PurchasedProduct, Transaction, ProductCategory } from '../types';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../utils/toast';
import Spinner from '../components/Spinner';
import { useProducts } from '../hooks/useProducts';
import { productCategories } from '../data/products';
import { ChevronLeftIcon, SearchIcon } from '../components/icons';

const SellConfirmationModal: React.FC<{
    onConfirm: () => void;
    onCancel: () => void;
    productName: string;
    sellPrice: number;
    isLoading: boolean;
}> = ({ onConfirm, onCancel, productName, sellPrice, isLoading }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-sm text-center p-6 shadow-lg animate-scale-in">
                <h3 className="font-bold text-lg mb-2">تأكيد البيع</h3>
                <p className="text-gray-600 mb-2">هل أنت متأكد أنك تريد بيع {productName}؟</p>
                <p className="text-gray-700 font-semibold mb-6">ستسترد: <span className="text-indigo-600">EGP {sellPrice.toFixed(2)}</span></p>
                <div className="flex justify-center gap-4">
                    <button onClick={onCancel} disabled={isLoading} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md">إلغاء</button>
                    <button 
                        onClick={onConfirm} 
                        disabled={isLoading}
                        className="px-6 py-2 bg-red-500 text-white rounded-md w-24 flex justify-center items-center disabled:bg-red-300"
                    >
                        {isLoading ? <Spinner size="sm" /> : 'بيع'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const ProductCard: React.FC<{ 
    product: Product;
    ownedInstances: PurchasedProduct[];
    index: number;
}> = ({ product, ownedInstances, index }) => {
    const { sellProduct } = useAuth();
    const navigate = useNavigate();
    const [isConfirmingSell, setIsConfirmingSell] = useState(false);
    const [isSelling, setIsSelling] = useState(false);

    const remaining = product.totalQuantity - product.soldCount;
    const isGloballySoldOut = remaining <= 0;
    const sellPrice = product.price * 0.10;

    const handleSellClick = () => {
        if (ownedInstances.length > 0) {
            setIsConfirmingSell(true);
        }
    };

    const confirmSell = async () => {
        if (ownedInstances.length === 0) return;
        
        setIsSelling(true);
        const oldestInstance = ownedInstances.reduce((oldest, current) => 
            current.purchaseDate < oldest.purchaseDate ? current : oldest
        );
        
        try {
            await sellProduct(oldestInstance.id);
            showToast(`تم بيع ${product.title} بنجاح`);
        } catch (error) {
            if (error instanceof Error) {
                showToast(error.message);
            } else {
                showToast('An unknown error occurred.');
            }
        } finally {
            setIsSelling(false);
            setIsConfirmingSell(false);
        }
    };
    
    const isLimitReached = product.purchaseLimit > 0 && ownedInstances.length >= product.purchaseLimit;

    return (
        <>
            {isConfirmingSell && (
                <SellConfirmationModal
                    productName={product.title}
                    sellPrice={sellPrice}
                    onConfirm={confirmSell}
                    onCancel={() => setIsConfirmingSell(false)}
                    isLoading={isSelling}
                />
            )}
            <div className="bg-white rounded-xl shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col h-full">
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center p-2">
                    <img src={product.iconUrl} alt={product.title} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="p-3 flex flex-col text-right text-gray-600 flex-grow">
                    <h3 className="font-bold text-gray-800 text-sm mb-1 truncate">{product.title}</h3>
                     <div className="text-xs mb-2">
                        <p className="text-indigo-600 font-semibold">EGP {product.price.toLocaleString()}</p>
                        <p className="text-green-600">+{product.dailyIncome.toLocaleString()} / يوم</p>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">{product.description}</p>
                    <div className="mt-auto">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{width: `${(remaining/product.totalQuantity)*100}%`}}></div>
                        </div>
                        <p className="text-xs text-gray-400">المتبقي: {remaining}</p>
                    </div>
                </div>
                <div className="p-2 bg-gray-50">
                     {isLimitReached ? (
                        <button disabled className="w-full py-2 bg-gray-400 text-white rounded-lg text-xs font-bold cursor-not-allowed">
                            الحد الأقصى
                        </button>
                    ) : !isGloballySoldOut ? (
                        <button 
                            onClick={() => navigate(`/products/${product.id}`)}
                            className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                            'يشترى'
                        </button>
                    ) : (
                        <button disabled className="w-full py-2 bg-gray-400 text-white rounded-lg text-xs font-bold cursor-not-allowed">
                            بيعت كلها
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}

const EmptyState: React.FC = () => (
    <div className="text-center py-20 card-enter">
        <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
        </div>
        <p className="text-gray-500">ليس لديك أجهزة حتى الآن.</p>
        <p className="text-sm text-gray-400 mt-2">قم بزيارة صفحة المنتج لشراء جهازك الأول.</p>
    </div>
);

const IncomeHistory: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    if (transactions.length === 0) {
        return <p className="text-center text-sm text-gray-500 py-4">لا يوجد سجل دخل لهذا الجهاز حتى الآن.</p>;
    }

    return (
        <div className="bg-gray-100 p-2 rounded-b-lg text-xs space-y-px">
            <div className="grid grid-cols-3 text-gray-500 font-bold p-1">
                <span>تاريخ</span>
                <span className="text-center">وصف</span>
                <span className="text-left">كمية</span>
            </div>
            {transactions.map(tx => {
                const date = new Date(tx.timestamp);
                const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
                const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                return (
                    <div key={tx.id} className="grid grid-cols-3 bg-white p-1.5 rounded items-center">
                        <div className="text-gray-500">
                           <p>{formattedDate}</p>
                           <p>{formattedTime}</p>
                        </div>
                        <p className="text-center text-gray-700">{tx.description}</p>
                        <p className="text-left font-semibold text-green-600">+{tx.amount.toFixed(2)}</p>
                    </div>
                )
            })}
        </div>
    )
};

const PurchasedProductCard: React.FC<{ 
    purchased: PurchasedProduct; 
    allTransactions: Transaction[];
    index: number;
}> = ({ purchased, allTransactions, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { getProductById } = useProducts();
    const productDetails = getProductById(purchased.productId);

    if (!productDetails) {
        return null;
    }

    const purchaseDate = new Date(purchased.purchaseDate);
    const expiryDate = new Date(purchaseDate.getTime() + productDetails.validity * 24 * 60 * 60 * 1000);

    const incomeHistory = allTransactions
        .filter(tx => tx.purchasedProductId === purchased.id && tx.type === 'income')
        .sort((a, b) => b.timestamp - a.timestamp);
    
    const totalEarned = incomeHistory.reduce((sum, tx) => sum + tx.amount, 0);

    return (
        <div className="bg-white rounded-lg shadow-md text-sm text-gray-600 card-enter" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="p-3 flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 p-2">
                    <img src={productDetails.iconUrl} alt={productDetails.title} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 text-right">
                    <h3 className="font-bold text-gray-800 text-base mb-1">{productDetails.title}</h3>
                    <p>تاريخ الشراء: {purchaseDate.toLocaleDateString('ar-EG')}</p>
                    <p>تنتهي في: {expiryDate.toLocaleDateString('ar-EG')}</p>
                    <p>الدخل اليومي: EGP {productDetails.dailyIncome.toLocaleString()}</p>
                    <p className="font-bold text-indigo-600">إجمالي الدخل المكتسب: EGP {totalEarned.toFixed(2)}</p>
                </div>
            </div>
             <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-gray-50 hover:bg-gray-100 p-2 border-t text-xs font-semibold text-indigo-600 flex justify-center items-center gap-1"
             >
                <span>سجل الدخل</span>
                <ChevronLeftIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : '-rotate-90'}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
                <IncomeHistory transactions={incomeHistory} />
            </div>
        </div>
    );
};


const ProductsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { products } = useProducts();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const myDevicesCount = currentUser?.purchasedProducts?.length || 0;
    const totalRevenue = currentUser?.totalRevenue.toFixed(2) || '0.00';
    
    const purchasedProducts = currentUser?.purchasedProducts || [];
    const allTransactions = currentUser?.transactions || [];
    const sortedMyProducts = [...purchasedProducts].sort((a,b) => b.purchaseDate - a.purchaseDate);

    const AllProductsTabContent = () => {
        const categoriesWithProducts = useMemo(() => {
            const categoryIdsWithProducts = new Set(products.map(p => p.categoryId));
            return productCategories.filter(c => categoryIdsWithProducts.has(c.id));
        }, [products]);
    
        useEffect(() => {
            if (categoriesWithProducts.length > 0 && selectedCategoryId === null) {
                setSelectedCategoryId(categoriesWithProducts[0].id);
            }
        }, [categoriesWithProducts, selectedCategoryId]);
    
        const displayedProducts = useMemo(() => {
            if (selectedCategoryId === null) return [];
            let productsInCategory = products.filter(p => p.categoryId === selectedCategoryId);
            if (!searchQuery) return productsInCategory;
            return productsInCategory.filter(p => 
                p.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }, [products, searchQuery, selectedCategoryId]);
    
        return (
            <div className="space-y-4">
                <div className="relative card-enter">
                    <input
                        type="text"
                        placeholder="ابحث عن أي منتج..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg text-right"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
    
                <div className="flex overflow-x-auto space-x-2 space-x-reverse pb-2 -mx-4 px-4 no-scrollbar">
                    {categoriesWithProducts.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategoryId(category.id)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                                selectedCategoryId === category.id 
                                ? 'bg-indigo-600 text-white shadow' 
                                : 'bg-white text-gray-700'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
    
                <div className="grid grid-cols-2 gap-4">
                    {displayedProducts.map((product, index) => {
                        const ownedInstances = currentUser?.purchasedProducts.filter(p => p.productId === product.id) || [];
                        return (
                            <ProductCard key={product.id} product={product} ownedInstances={ownedInstances} index={index} />
                        );
                    })}
                </div>
                
                {displayedProducts.length === 0 && (
                    <div className="text-center py-10">
                        <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">لا توجد منتجات مطابقة في هذه الفئة.</p>
                    </div>
                )}
            </div>
        );
    }
    

    return (
        <div className="bg-gray-100">
             <header className="bg-gradient-to-b from-indigo-400 to-indigo-600 h-40 p-4 text-white text-right relative">
                <button onClick={() => navigate(-1)} className="absolute top-2 right-2 p-2 z-10">
                    <ChevronLeftIcon className="w-6 h-6 transform scale-x-[-1]" />
                </button>
                <h1 className="text-xl">المنتج</h1>
                <h2 className="text-2xl font-bold">استضافة الذكاء</h2>
                <h2 className="text-2xl font-bold -mt-2">الاصطناعي</h2>
                <p className="text-xs mt-1">استمتع بالمزايا المستمرة</p>
                <div className="absolute top-4 left-4 h-24 w-24 opacity-20">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3" /><circle cx="12" cy="12" r="4" /></svg>
                </div>
            </header>

            <main className="p-4 -mt-16 relative z-10 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-500 text-white p-3 rounded-lg text-center shadow card-enter">
                        <p className="text-lg font-bold">{myDevicesCount}</p>
                        <p className="text-xs">أجهزتي</p>
                    </div>
                     <div className="bg-white text-gray-700 p-3 rounded-lg text-center shadow card-enter" style={{ animationDelay: '50ms' }}>
                        <p className="text-lg font-bold">EGP {totalRevenue}</p>
                        <p className="text-xs">إجمالي الإيرادات</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-1 flex justify-around card-enter">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'all' ? 'bg-indigo-500 text-white shadow' : 'text-gray-600'}`}
                    >
                        جميع المنتجات
                    </button>
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'my' ? 'bg-indigo-500 text-white shadow' : 'text-gray-600'}`}
                    >
                        منتجاتي ({purchasedProducts.length})
                    </button>
                </div>

                {activeTab === 'all' && <AllProductsTabContent />}

                {activeTab === 'my' && (
                    <div className="space-y-4">
                        {sortedMyProducts.length === 0 ? (
                            <EmptyState />
                        ) : (
                            sortedMyProducts.map((p, index) => (
                                <PurchasedProductCard key={p.id} purchased={p} allTransactions={allTransactions} index={index} />
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProductsPage;