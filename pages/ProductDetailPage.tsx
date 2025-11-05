import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import SubPageLayout from '../components/SubPageLayout';
import Spinner from '../components/Spinner';
import { showToast } from '../utils/toast';

const ProductDetailPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { currentUser, purchaseProduct } = useAuth();
    const { products, getProductById } = useProducts();
    const [isBuying, setIsBuying] = useState(false);

    // Memoize product details to avoid re-calculating on every render
    const productData = useMemo(() => {
        if (!productId) return null;
        const pId = parseInt(productId, 10);
        return getProductById(pId);
    }, [productId, products, getProductById]);

    // Effect to handle case where product doesn't exist
    useEffect(() => {
        if (products.length > 0 && !productData) { // Check only after products are loaded
            showToast('المنتج غير موجود أو لم يعد متاحًا.');
            navigate('/products', { replace: true });
        }
    }, [productData, products, navigate]);

    if (!productData) {
        return (
            <SubPageLayout title="جار التحميل...">
                <div className="flex items-center justify-center h-64">
                    <Spinner color="dark" />
                </div>
            </SubPageLayout>
        );
    }

    const {
        title,
        description,
        price,
        dailyIncome,
        validity,
        totalQuantity,
        purchaseLimit,
        iconUrl,
        soldCount
    } = productData;

    const remaining = totalQuantity - soldCount;
    const isGloballySoldOut = remaining <= 0;
    
    const ownedInstances = currentUser?.purchasedProducts.filter(p => p.productId === productData.id) || [];
    const isLimitReached = purchaseLimit > 0 && ownedInstances.length >= purchaseLimit;

    const handlePurchase = async () => {
        setIsBuying(true);
        try {
            await purchaseProduct(productData.id);
            showToast(`تم شراء ${title} بنجاح!`);
            navigate('/my-products');
        } catch (error) {
            if (error instanceof Error) {
                showToast(error.message);
            }
        } finally {
            setIsBuying(false);
        }
    };
    
    const getButtonText = () => {
        if (isGloballySoldOut) return 'بيعت كلها';
        if (isLimitReached) return 'الحد الأقصى';
        return `تأكيد الشراء - EGP ${price.toLocaleString()}`;
    };

    return (
        <SubPageLayout title="تفاصيل المنتج">
            <div className="bg-gray-800 text-gray-200 min-h-screen">
                <div className="w-full h-56 bg-gray-700 flex items-center justify-center p-4">
                    <img src={iconUrl} alt={title} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="p-4 text-right space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-100 mb-2">{title}</h1>
                        <p className="text-gray-300 leading-relaxed">{description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-right p-3 bg-indigo-500/20 rounded-lg">
                            <p className="text-xs text-indigo-300">السعر</p>
                            <p className="font-bold text-indigo-400 text-lg">EGP {price.toLocaleString()}</p>
                        </div>
                        <div className="text-right p-3 bg-green-500/20 rounded-lg">
                            <p className="text-xs text-green-300">الدخل اليومي</p>
                            <p className="font-bold text-green-400 text-lg">EGP {dailyIncome.toLocaleString()}</p>
                        </div>
                         <div className="text-right p-3 bg-gray-700 rounded-lg">
                            <p className="text-xs text-gray-400">فترة الصلاحية</p>
                            <p className="font-semibold text-gray-200">{validity} يوم</p>
                        </div>
                        <div className="text-right p-3 bg-gray-700 rounded-lg">
                            <p className="text-xs text-gray-400">المتبقي</p>
                            <p className="font-semibold text-gray-200">{remaining} / {totalQuantity}</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={handlePurchase}
                        disabled={isBuying || isGloballySoldOut || isLimitReached}
                        className="w-full p-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-lg font-bold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {isBuying ? <Spinner /> : getButtonText()}
                    </button>
                </div>
            </div>
        </SubPageLayout>
    );
};

export default ProductDetailPage;