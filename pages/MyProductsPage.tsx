import React, { useState } from 'react';
import SubPageLayout from '../components/SubPageLayout';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import { PurchasedProduct, Transaction } from '../types';
import { ChevronLeftIcon } from '../components/icons';

const EmptyState: React.FC = () => (
    <div className="text-center py-20 card-enter">
        <div className="w-32 h-32 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
        </div>
        <p className="text-gray-400">ليس لديك أجهزة حتى الآن.</p>
        <p className="text-sm text-gray-500 mt-2">قم بزيارة صفحة المنتج لشراء جهازك الأول.</p>
    </div>
);

const IncomeHistory: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    if (transactions.length === 0) {
        return <p className="text-center text-sm text-gray-400 py-4">لا يوجد سجل دخل لهذا الجهاز حتى الآن.</p>;
    }

    return (
        <div className="bg-gray-800 p-2 rounded-b-lg text-xs space-y-px">
            <div className="grid grid-cols-3 text-gray-400 font-bold p-1">
                <span>تاريخ</span>
                <span className="text-center">وصف</span>
                <span className="text-left">كمية</span>
            </div>
            {transactions.map(tx => {
                const date = new Date(tx.timestamp);
                const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
                const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                return (
                    <div key={tx.id} className="grid grid-cols-3 bg-gray-700 p-1.5 rounded items-center">
                        <div className="text-gray-400">
                           <p>{formattedDate}</p>
                           <p>{formattedTime}</p>
                        </div>
                        <p className="text-center text-gray-300">{tx.description}</p>
                        <p className="text-left font-semibold text-green-400">+{tx.amount.toFixed(2)}</p>
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
        <div className="bg-gray-700 rounded-lg shadow-md text-sm text-gray-300 card-enter" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="p-3 flex gap-4">
                <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 p-2">
                    <img src={productDetails.iconUrl} alt={productDetails.title} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 text-right">
                    <h3 className="font-bold text-gray-100 text-base mb-1">{productDetails.title}</h3>
                    <p>تاريخ الشراء: {purchaseDate.toLocaleDateString('ar-EG')}</p>
                    <p>تنتهي في: {expiryDate.toLocaleDateString('ar-EG')}</p>
                    <p>الدخل اليومي: EGP {productDetails.dailyIncome.toLocaleString()}</p>
                    <p className="font-bold text-indigo-400">إجمالي الدخل المكتسب: EGP {totalEarned.toFixed(2)}</p>
                </div>
            </div>
             <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-gray-600 hover:bg-gray-500 p-2 border-t border-gray-600 text-xs font-semibold text-indigo-400 flex justify-center items-center gap-1"
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

const MyProductsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const purchasedProducts = currentUser?.purchasedProducts || [];
    const allTransactions = currentUser?.transactions || [];

    const sortedProducts = [...purchasedProducts].sort((a,b) => b.purchaseDate - a.purchaseDate);

    return (
        <SubPageLayout title="أجهزتي">
            <div className="p-4 space-y-4">
                {sortedProducts.length === 0 ? (
                    <EmptyState />
                ) : (
                    sortedProducts.map((p, index) => (
                        <PurchasedProductCard key={p.id} purchased={p} allTransactions={allTransactions} index={index} />
                    ))
                )}
            </div>
        </SubPageLayout>
    );
};

export default MyProductsPage;