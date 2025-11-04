import React, { useState } from 'react';
import SubPageLayout from '../components/SubPageLayout';
import { useAuth } from '../hooks/useAuth';
import { Transaction } from '../types';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '../components/icons';

const EmptyState: React.FC = () => (
    <div className="text-center py-20">
        <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 11v6l8 4m8-10v6l-8 4" /></svg>
        </div>
        <p className="text-gray-500">لا مزيد من البيانات</p>
    </div>
);

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const date = new Date(transaction.timestamp);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    const isPositive = transaction.amount > 0;
    
    return (
        <div className="bg-white p-4 text-right border-b border-gray-100">
            <p className="font-mono text-base text-black font-bold mb-2 tracking-tight">{transaction.id}</p>
             <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-700">{transaction.description}</p>
                <p className={`font-bold text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{transaction.amount.toFixed(2)} EGP
                </p>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-left">{formattedDate}</p>
        </div>
    );
};

const getStatusStyles = (status: Transaction['status']) => {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'failed':
            return 'bg-red-100 text-red-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getStatusText = (status: Transaction['status']) => {
    switch (status) {
        case 'completed':
            return 'نجاح';
        case 'failed':
            return 'فشل';
        case 'pending':
            return 'قيد الانتظار';
        default:
            return 'غير معروف';
    }
}

const getStatusIcon = (status: Transaction['status']) => {
    const iconClass = "w-3.5 h-3.5 mr-1";
    switch (status) {
        case 'completed':
            return <CheckCircleIcon className={iconClass} />;
        case 'failed':
            return <XCircleIcon className={iconClass} />;
        case 'pending':
            return <ClockIcon className={iconClass} />;
        default:
            return null;
    }
};

const WithdrawalItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const date = new Date(transaction.timestamp);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    const feeMatch = transaction.description.match(/رسوم ([\d.]+) جنيه/);
    const fee = feeMatch ? parseFloat(feeMatch[1]) : 0;
    const receivedAmount = Math.abs(transaction.amount) - fee;

    return (
        <div className="bg-white p-4 text-right border-b border-gray-100">
            <p className="font-mono text-base text-black font-bold mb-2 tracking-tight">{transaction.id}</p>
            <p className="font-bold text-lg my-1">
                <span className="text-red-500">EGP {Math.abs(transaction.amount).toFixed(2)}</span> <span className="text-gray-800 font-semibold">سحب المال</span>
            </p>
            <p className="text-sm text-gray-600">وصول فعلي: EGP {receivedAmount.toFixed(2)}</p>
            <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-400">{formattedDate}</p>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center justify-center ${getStatusStyles(transaction.status)}`}>
                    {getStatusIcon(transaction.status)}
                    <span>{getStatusText(transaction.status)}</span>
                </span>
            </div>
        </div>
    );
};


const RecordsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Transaction['type'] | 'all'>('all');
    const { currentUser } = useAuth();

    const tabs: { id: Transaction['type'] | 'all'; label: string }[] = [
        { id: 'all', label: 'الكل' },
        { id: 'recharge', label: 'شحن' },
        { id: 'withdraw', label: 'سحب' },
        { id: 'income', label: 'دخل' },
        { id: 'purchase', label: 'شراء' },
        { id: 'sell', label: 'بيع' },
        { id: 'reward', label: 'مكافأة' },
    ];
    
    const transactions = currentUser?.transactions || [];
    
    const activeTabLabel = tabs.find(tab => tab.id === activeTab)?.label || 'السجلات';

    const renderContent = () => {
        const filteredTransactions = activeTab === 'all'
            ? transactions
            : transactions.filter(tx => tx.type === activeTab);

        if (filteredTransactions.length === 0) {
            return <EmptyState />;
        }
        
        return (
            <div className="bg-gray-200">
                {filteredTransactions.map(tx => {
                    if (tx.type === 'withdraw') {
                        return <WithdrawalItem key={tx.id} transaction={tx} />
                    }
                    return <TransactionItem key={tx.id} transaction={tx} />;
                })}
                <p className="text-center text-gray-400 py-4 text-sm">لا مزيد من البيانات</p>
            </div>
        );
    }

    return (
        <SubPageLayout title={activeTabLabel}>
            <div className="bg-white shadow">
                <div className="flex justify-around border-b">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 text-sm font-semibold whitespace-nowrap px-1 ${activeTab === tab.id ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-gray-500'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="pt-2">
                {renderContent()}
            </div>
        </SubPageLayout>
    );
};

export default RecordsPage;