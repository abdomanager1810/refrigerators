import React from 'react';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types';

const GlobalSalesTracker: React.FC = () => {
    const { products } = useProducts();

    // Display progress for the first 3 products for a cleaner UI
    const productsToShow = products.slice(0, 3);

    const getProgress = (product: Product) => {
        if (product.totalQuantity === 0) return 0;
        return (product.soldCount / product.totalQuantity) * 100;
    };

    return (
        <div className="bg-gray-700 rounded-lg shadow p-4 text-right card-enter" style={{ animationDelay: '300ms' }}>
            <h3 className="font-bold text-gray-200 mb-3">حالة المبيعات العالمية</h3>
            <div className="space-y-4">
                {productsToShow.map(p => {
                    return (
                        <div key={p.id}>
                            <div className="flex justify-between items-center text-xs mb-1">
                                <span className="font-semibold text-gray-300">{p.title}</span>
                                <span className="text-gray-400">{p.soldCount} / {p.totalQuantity} تم البيع</span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2.5">
                                <div 
                                    className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${getProgress(p)}%` }}>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default GlobalSalesTracker;