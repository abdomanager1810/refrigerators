import React, { useState } from 'react';
import SubPageLayout from '../components/SubPageLayout';
import { useAuth } from '../hooks/useAuth';
import { Transaction } from '../types';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '../components/icons';

const EmptyState: React.FC = () => (
    <div className="text-center py-20">
        <div className="w-32 h-32 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 11v6l8 4m8-10v6l-8 4" /></svg>
        </div>
        <p className="text-gray-400">لا مزيد من البيانات</p>
    </div>
);

const getStatusStyles = (status: Transaction['status']) => {
    switch (status) {
        case 'completed':
            return 'bg-green-500/20 text-green-300';
        case 'rejected':
            return 'bg-red-500/20 text-red-300';
        case 'pending':
            return 'bg-yellow-500/20 text-yellow-300';
        default:
            return 'bg-gray-500/20 text-gray-300';
    }
};

const getStatusText = (status: Transaction['status']) => {
    switch (status) {
        case 'completed':
            return 'نجاح';
        case 'rejected':
            return 'مرفوض';
        case 'pending':
            return 'قيد الانتظار';
        default:
            return 'غير معروف';
    }
}

const getStatusIcon = (status: Transaction['status']) => {
    const iconClass = "w-3.5 h-3.5 ml-1";
    switch (status) {
        case 'completed':
            return <CheckCircleIcon className={iconClass} />;
        case 'rejected':
            return <XCircleIcon className={iconClass} />;
        case 'pending':
            return <ClockIcon className={iconClass} />;
        default:
            return null;
    }
};

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const date = new Date(transaction.timestamp);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    const isPositive = transaction.amount > 0;
    
    const showStatus = transaction.type === 'recharge' || transaction.type === 'withdraw';
    
    return (
        <div className="bg-gray-700 p-4 text-right border-b border-gray-600">
            <p className="font-mono text-base text-gray-100 font-bold mb-2 tracking-tight">{transaction.id}</p>
             <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-200">{transaction.description}</p>
                <p className={`font-bold text-lg ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{transaction.amount.toFixed(2)} EGP
                </p>
            </div>
            <div className="flex justify-between items-center mt-2">
                 <p className="text-xs text-gray-400">{formattedDate}</p>
                 {showStatus && transaction.status && (
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center justify-center ${getStatusStyles(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span>{getStatusText(transaction.status)}</span>
                    </span>
                 )}
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
            <div className="bg-gray-800">
                {filteredTransactions.map(tx => <TransactionItem key={tx.id} transaction={tx} />)}
                <p className="text-center text-gray-500 py-4 text-sm">لا مزيد من البيانات</p>
            </div>
        );
    }

    return (
        <SubPageLayout title={activeTabLabel}>
            <div className="bg-gray-700 shadow">
                <div className="flex justify-around border-b border-gray-600 overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 text-sm font-semibold whitespace-nowrap px-2 ${activeTab === tab.id ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}
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