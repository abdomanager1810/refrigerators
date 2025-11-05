import React, { useState, useEffect, useMemo } from 'react';
import SubPageLayout from '../components/SubPageLayout';
import { User, Transaction, Product, SiteConfig, Banner, CustomerServiceLink, PromoCode, PurchasedProduct, WithdrawalWallet, WalletType, ChatSession, ChatMessage } from '../types';
import * as db from '../data/db';
import * as configDb from '../data/configDb';
import { showToast } from '../utils/toast';
import Spinner from '../components/Spinner';
import { useProducts } from '../hooks/useProducts';
import { productCategories } from '../data/products';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { 
    LayoutGridIcon, ListChecksIcon, PackageIcon, BellIcon, SettingsIcon, PlusCircleIcon, PencilIcon, Trash2Icon,
    ArrowDownCircleIcon, ArrowUpCircleIcon, TrendingUpIcon, UsersIcon, ClockIcon, SearchIcon, EyeIcon, XCircleIcon,
    MessageSquareIcon
} from '../components/icons';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';

const walletOptions: { id: WalletType; name: string }[] = [
    { id: 'Vodafone Cash', name: 'فودافون كاش' },
    { id: 'Orange Cash', name: 'أورانج كاش' },
    { id: 'Etisalat Cash', name: 'اتصالات كاش' },
    { id: 'WE Pay', name: 'WE Pay' },
    { id: 'InstaPay', name: 'إنستا باي' },
];

type AdminTab = 'dashboard' | 'transactions' | 'products' | 'notifications' | 'settings' | 'content' | 'users' | 'supportChats';

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { config, updateConfig } = useSiteConfig();

    const refreshData = () => {
        setIsLoading(true);
        setTimeout(() => {
            setUsers(db.getAllUsers());
            setIsLoading(false);
        }, 100);
    };

    useEffect(() => {
        refreshData();
    }, []);

    const TABS: { id: AdminTab; label: string; icon: React.FC<any> }[] = [
        { id: 'dashboard', label: 'الرئيسية', icon: LayoutGridIcon },
        { id: 'transactions', label: 'المعاملات', icon: ListChecksIcon },
        { id: 'users', label: 'المستخدمون', icon: UsersIcon },
        { id: 'supportChats', label: 'الدردشات', icon: MessageSquareIcon },
        { id: 'products', label: 'المنتجات', icon: PackageIcon },
        { id: 'content', label: 'المحتوى', icon: PencilIcon },
        { id: 'notifications', label: 'الإشعارات', icon: BellIcon },
        { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
    ];
    
    const pendingTransactionsCount = useMemo(() => {
        return users.reduce((count, user) => {
            return count + user.transactions.filter(tx => (tx.type === 'recharge' || tx.type === 'withdraw') && tx.status === 'pending').length;
        }, 0);
    }, [users]);


    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center p-10"><Spinner color="dark" /></div>;
        }

        switch (activeTab) {
            case 'dashboard':
                return <DashboardTab users={users} pendingCount={pendingTransactionsCount} />;
            case 'transactions':
                return <TransactionsTab users={users} onAction={refreshData} pendingCount={pendingTransactionsCount}/>;
            case 'products':
                return <ProductsTab onAction={refreshData} />;
            case 'content':
                return <ContentTab config={config} updateConfig={updateConfig} />;
            case 'notifications':
                return <NotificationsTab onAction={refreshData} />;
            case 'users':
                return <UsersTab users={users} onAction={refreshData} />;
            case 'supportChats':
                return <SupportChatsTab />;
            case 'settings':
                return <SettingsTab config={config} updateConfig={updateConfig} />;
            default:
                return null;
        }
    };
    
    return (
        <SubPageLayout title="لوحة التحكم للمسؤول">
             <div className="bg-gray-800 shadow-md sticky top-14 z-10">
                <div className="flex justify-around border-b border-gray-700 overflow-x-auto no-scrollbar">
                    {TABS.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 px-1 text-xs sm:text-sm font-semibold whitespace-nowrap flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-colors ${activeTab === tab.id ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:bg-gray-700'}`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span>{tab.label}</span>
                             {tab.id === 'transactions' && pendingTransactionsCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                    {pendingTransactionsCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-2 sm:p-4 bg-gray-900 min-h-screen">
                {renderContent()}
            </div>
        </SubPageLayout>
    );
};

// --- DASHBOARD TAB ---
const DashboardTab: React.FC<{ users: User[], pendingCount: number }> = ({ users, pendingCount }) => {
    const stats = useMemo(() => {
        let totalDeposits = 0;
        let totalWithdrawals = 0;
        users.forEach(user => {
            user.transactions.forEach(tx => {
                if (tx.type === 'recharge' && tx.status === 'completed') {
                    totalDeposits += tx.amount;
                }
                if (tx.type === 'withdraw' && tx.status === 'completed') {
                    totalWithdrawals += Math.abs(tx.amount);
                }
            });
        });
        const companyProfit = totalWithdrawals * 0.15; // Profit is withdrawal fee
        return { totalDeposits, totalWithdrawals, companyProfit, totalUsers: users.length };
    }, [users]);

    return (
        <div className="grid grid-cols-2 gap-4 text-center">
            <StatCard title="إجمالي الودائع" value={`EGP ${stats.totalDeposits.toFixed(2)}`} icon={ArrowDownCircleIcon} color="green" />
            <StatCard title="إجمالي السحوبات" value={`EGP ${stats.totalWithdrawals.toFixed(2)}`} icon={ArrowUpCircleIcon} color="red" />
            <StatCard title="أرباح الشركة" value={`EGP ${stats.companyProfit.toFixed(2)}`} icon={TrendingUpIcon} color="indigo" />
            <StatCard title="إجمالي المستخدمين" value={`${stats.totalUsers}`} icon={UsersIcon} color="blue" />
            <StatCard title="المعاملات المعلقة" value={`${pendingCount}`} icon={ClockIcon} color="yellow" />
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.FC<any>; color: string }> = ({ title, value, icon: Icon, color }) => {
    const colors = {
        green: 'text-green-400 bg-green-500/20',
        red: 'text-red-400 bg-red-500/20',
        indigo: 'text-indigo-400 bg-indigo-500/20',
        blue: 'text-blue-400 bg-blue-500/20',
        yellow: 'text-yellow-400 bg-yellow-500/20',
    }
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center justify-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${colors[color as keyof typeof colors]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-gray-400 text-xs font-semibold">{title}</h3>
            <p className="text-xl font-bold text-gray-100 mt-1">{value}</p>
        </div>
    );
}

// --- REJECTION REASON MODAL ---
const RejectionReasonModal: React.FC<{
    onConfirm: (reason: string) => void;
    onCancel: () => void;
    isLoading: boolean;
}> = ({ onConfirm, onCancel, isLoading }) => {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        if (reason.trim()) {
            onConfirm(reason.trim());
        } else {
            showToast('Please provide a reason for rejection.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 text-gray-200 rounded-lg w-full max-w-sm text-right p-6 shadow-lg animate-scale-in">
                <h3 className="font-bold text-lg mb-2">سبب الرفض</h3>
                <p className="text-gray-300 mb-4 text-sm">يرجى تقديم سبب لرفض طلب السحب هذا. سيتم إرسال هذا السبب إلى المستخدم.</p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="على سبيل المثال، معلومات المحفظة غير صحيحة، انتهاك القواعد، إلخ."
                    rows={3}
                    className="w-full p-2 border rounded-md mb-4 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                <div className="flex justify-end gap-4">
                    <button onClick={onCancel} disabled={isLoading} className="px-6 py-2 bg-gray-600 text-gray-200 rounded-md font-semibold">إلغاء</button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || !reason.trim()}
                        className="px-6 py-2 bg-red-500 text-white rounded-md font-semibold w-32 flex justify-center items-center disabled:bg-red-300"
                    >
                        {isLoading ? <Spinner size="sm" /> : 'تأكيد الرفض'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- TRANSACTIONS TAB ---
const TransactionsTab: React.FC<{ users: User[], onAction: () => void, pendingCount: number }> = ({ users, onAction, pendingCount }) => {
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [rejectingTransaction, setRejectingTransaction] = useState<{ user: User; transaction: Transaction } | null>(null);

    const pendingTransactions = useMemo(() => {
        const allPending: { user: User; transaction: Transaction }[] = [];
        users.forEach(user => {
            user.transactions.forEach(tx => {
                if ((tx.type === 'recharge' || tx.type === 'withdraw') && tx.status === 'pending') {
                    allPending.push({ user, transaction: tx });
                }
            });
        });
        return allPending.sort((a, b) => b.transaction.timestamp - a.transaction.timestamp);
    }, [users]);
    
    const handleTransaction = async (userPhone: string, txId: string, action: 'approve' | 'reject', reason?: string) => {
        setIsProcessing(txId);
        try {
            const user = db.findUserByPhone(userPhone);
            if (!user) throw new Error("User not found");

            const txIndex = user.transactions.findIndex(t => t.id === txId);
            if (txIndex === -1) throw new Error("Transaction not found");

            const tx = user.transactions[txIndex];
            const isApproved = action === 'approve';

            let notificationTitle = '';
            let notificationMessage = '';
            
            if (tx.type === 'recharge') {
                 if (isApproved) {
                    tx.status = 'completed';
                    user.balance += tx.amount;
                    notificationTitle = 'تمت الموافقة على الإيداع';
                    notificationMessage = `تمت إضافة ${tx.amount.toFixed(2)} جنيه إلى رصيدك.`;

                    // Handle Promo Code Bonus
                    const promoMatch = tx.description.match(/\(كود الخصم: (.*)\)/);
                    if (promoMatch) {
                        const codeStr = promoMatch[1];
                        const siteConfig = configDb.getConfig();
                        const promoCodeIndex = siteConfig.promoCodes.findIndex(p => p.code.toUpperCase() === codeStr.toUpperCase());
                        
                        if (promoCodeIndex !== -1 && siteConfig.promoCodes[promoCodeIndex].usesLeft > 0) {
                            const promo = siteConfig.promoCodes[promoCodeIndex];
                            user.balance += promo.bonusAmount;

                            // Add bonus transaction
                            user.transactions.unshift({
                                id: crypto.randomUUID(),
                                type: 'reward',
                                description: `مكافأة كود الخصم: ${promo.code}`,
                                amount: promo.bonusAmount,
                                timestamp: Date.now(),
                                status: 'completed'
                            });

                            notificationMessage += ` لقد حصلت أيضًا على مكافأة قدرها ${promo.bonusAmount.toFixed(2)} جنيه!`;

                            // Update promo code uses
                            siteConfig.promoCodes[promoCodeIndex].usesLeft -= 1;
                            configDb.saveConfig(siteConfig);
                        }
                    }
                } else {
                    tx.status = 'rejected';
                    notificationTitle = 'تم رفض الإيداع';
                    notificationMessage = `تم رفض طلب الإيداع الخاص بك بمبلغ ${tx.amount.toFixed(2)} جنيه.`;
                }
            } else if (tx.type === 'withdraw') {
                 if (isApproved) {
                    tx.status = 'completed';
                    notificationTitle = 'تمت الموافقة على السحب';
                    notificationMessage = `اكتمل طلب السحب الخاص بك بمبلغ ${Math.abs(tx.amount).toFixed(2)} جنيه بنجاح.`;
                } else {
                    tx.status = 'rejected';
                    user.balance += Math.abs(tx.amount); // Refund
                    notificationTitle = 'تم رفض السحب';
                    notificationMessage = `تم رفض طلب السحب الخاص بك بمبلغ ${Math.abs(tx.amount).toFixed(2)} جنيه. تم رد المبلغ إلى رصيدك.`;
                    if (reason) {
                        tx.description = `${tx.description} (السبب: ${reason})`;
                        notificationMessage += ` السبب: ${reason}`;
                    }
                }
            }
            
            user.notifications.unshift({
                id: crypto.randomUUID(),
                title: notificationTitle,
                message: notificationMessage,
                timestamp: Date.now(),
                read: false,
            });

            db.saveUser(user);
            showToast(`Transaction ${action}d successfully`);
            onAction();
        } catch (e) {
            showToast(e instanceof Error ? e.message : 'An error occurred');
        } finally {
            setIsProcessing(null);
            setRejectingTransaction(null);
        }
    }

    if (pendingTransactions.length === 0) {
        return <div className="bg-gray-800 p-4 rounded-lg shadow text-center text-gray-400">لا توجد معاملات معلقة.</div>;
    }

    return (
        <div className="space-y-3">
            {rejectingTransaction && (
                <RejectionReasonModal
                    isLoading={!!isProcessing}
                    onCancel={() => setRejectingTransaction(null)}
                    onConfirm={(reason) => {
                        handleTransaction(rejectingTransaction.user.phone, rejectingTransaction.transaction.id, 'reject', reason);
                    }}
                />
            )}
            <h2 className="text-right font-bold text-gray-200">المعاملات المعلقة ({pendingCount})</h2>
            {pendingTransactions.map(({ user, transaction: tx }) => (
                <div key={tx.id} className="bg-gray-800 p-3 rounded-lg shadow text-sm text-gray-300">
                    <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
                        <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${tx.type === 'recharge' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {tx.type === 'recharge' ? 'إيداع' : 'سحب'}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleString('ar-EG', { hour12: false, year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                    <p><span className="font-semibold text-gray-200">المعرف:</span> {tx.id}</p>
                    <p><span className="font-semibold text-gray-200">المستخدم:</span> {user.phone}</p>
                    <p><span className="font-semibold text-gray-200">المبلغ:</span> EGP {Math.abs(tx.amount).toFixed(2)}</p>
                    <p className="text-xs text-blue-400">{tx.description}</p>
                     {tx.type === 'recharge' && tx.senderWallet && (
                        <p><span className="font-semibold text-gray-200">محفظة المرسل:</span> {tx.senderWallet}</p>
                    )}
                    {tx.type === 'withdraw' && user.withdrawalWallet && (
                         <div className="text-xs bg-gray-900/50 p-2 rounded-md mt-1">
                             <p><span className="font-semibold text-gray-200">الاسم:</span> {user.withdrawalWallet.ownerName}</p>
                             <p><span className="font-semibold text-gray-200">النوع:</span> {user.withdrawalWallet.walletType}</p>
                             <p><span className="font-semibold text-gray-200">الرقم:</span> {user.withdrawalWallet.walletNumber}</p>
                         </div>
                    )}
                    <div className="flex gap-2 mt-3">
                        <button 
                            onClick={() => handleTransaction(user.phone, tx.id, 'approve')}
                            disabled={!!isProcessing}
                            className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded-md font-bold disabled:bg-gray-500 flex justify-center items-center transition-colors"
                        >
                            {isProcessing === tx.id ? <Spinner size="sm" /> : 'موافقة'}
                        </button>
                        <button 
                             onClick={() => {
                                if (tx.type === 'withdraw') {
                                    setRejectingTransaction({ user, transaction: tx });
                                } else {
                                    handleTransaction(user.phone, tx.id, 'reject');
                                }
                             }}
                             disabled={!!isProcessing}
                             className="w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded-md font-bold disabled:bg-gray-500 flex justify-center items-center transition-colors"
                        >
                             {isProcessing === tx.id ? <Spinner size="sm" /> : 'رفض'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};


// --- PRODUCTS TAB ---
const ProductsTab: React.FC<{ onAction: () => void }> = ({ onAction }) => {
    const { products, addProduct, updateProduct, deleteProduct } = useProducts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = (product: Product) => {
        setDeletingProduct(product);
    };

    const confirmDelete = async () => {
        if (!deletingProduct) return;
        setIsProcessing(true);
        try {
            await deleteProduct(deletingProduct.id);
            showToast('Product deleted successfully.');
            onAction();
        } catch (e) {
            showToast(e instanceof Error ? e.message : 'An error occurred.');
        } finally {
            setIsProcessing(false);
            setDeletingProduct(null);
        }
    };

    const handleSave = async (productData: Product | Omit<Product, 'id' | 'totalIncome'>) => {
        setIsProcessing(true);
        try {
            if ('id' in productData) {
                await updateProduct(productData);
                showToast('Product updated successfully.');
            } else {
                await addProduct(productData);
                showToast('Product added successfully.');
            }
            onAction();
        } catch (e) {
             showToast(e instanceof Error ? e.message : 'An error occurred.');
        } finally {
            setIsProcessing(false);
            setIsModalOpen(false);
            setEditingProduct(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-right text-gray-200">إدارة المنتجات ({products.length})</h2>
                <button onClick={handleAddNew} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>إضافة منتج</span>
                </button>
            </div>
            <div className="space-y-3">
                {products.map(p => (
                    <div key={p.id} className="bg-gray-800 p-3 rounded-lg shadow flex items-center gap-3">
                        <img src={p.iconUrl} alt={p.title} className="w-12 h-12 object-contain bg-gray-700 rounded-md p-1" />
                        <div className="flex-grow text-right text-sm">
                            <p className="font-bold text-gray-100">{p.title}</p>
                            <p className="text-xs text-gray-400">
                                السعر: {p.price} | الدخل: {p.dailyIncome} | الكمية: {p.totalQuantity - p.soldCount}/{p.totalQuantity}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(p)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-full"><PencilIcon className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(p)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full"><Trash2Icon className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
            {isModalOpen && <ProductEditModal product={editingProduct} onSave={handleSave} onClose={() => setIsModalOpen(false)} isProcessing={isProcessing} />}
            {deletingProduct && (
                 <ConfirmationModal
                    title="حذف المنتج"
                    message={`هل أنت متأكد أنك تريد حذف "${deletingProduct.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
                    confirmText="حذف"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeletingProduct(null)}
                    isLoading={isProcessing}
                />
            )}
        </div>
    );
};

// --- PRODUCT EDIT MODAL ---
const ProductEditModal: React.FC<{ product: Product | null, onSave: (p: any) => void, onClose: () => void, isProcessing: boolean }> = ({ product, onSave, onClose, isProcessing }) => {
    const initialState = useMemo(() => ({
        title: '', description: '', categoryId: 1, price: 0, dailyIncome: 0,
        validity: 60, totalQuantity: 100, soldCount: 0, purchaseLimit: 1, iconUrl: '',
        ...product,
    }), [product]);
    
    const [formData, setFormData] = useState(initialState);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    }
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 text-gray-200 rounded-lg w-full max-w-lg shadow-lg animate-scale-in text-right max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                     <h3 className="font-bold text-lg">{product ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-sm mb-1">العنوان</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600" required />
                        </div>
                         <div>
                            <label className="block font-semibold text-sm mb-1">الفئة</label>
                            <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600">
                                {productCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block font-semibold text-sm mb-1">الوصف</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600" />
                    </div>
                     <div>
                        <label className="block font-semibold text-sm mb-1">رابط الصورة</label>
                        <input type="text" name="iconUrl" value={formData.iconUrl} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600" placeholder="https://i.imgur.com/image.png" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <div>
                            <label className="block font-semibold text-sm mb-1">السعر</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600" />
                        </div>
                        <div>
                            <label className="block font-semibold text-sm mb-1">الدخل اليومي</label>
                            <input type="number" name="dailyIncome" value={formData.dailyIncome} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600" />
                        </div>
                         <div>
                            <label className="block font-semibold text-sm mb-1">الصلاحية (أيام)</label>
                            <input type="number" name="validity" value={formData.validity} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600" />
                        </div>
                         <div>
                            <label className="block font-semibold text-sm mb-1">حد الشراء</label>
                            <input type="number" name="purchaseLimit" value={formData.purchaseLimit} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block font-semibold text-sm mb-1">الكمية الإجمالية</label>
                            <input type="number" name="totalQuantity" value={formData.totalQuantity} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600" />
                        </div>
                        <div>
                            <label className="block font-semibold text-sm mb-1">الكمية المباعة</label>
                            <input type="number" name="soldCount" value={formData.soldCount} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-3">
                        <button type="button" onClick={onClose} className="bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-lg">إلغاء</button>
                        <button type="submit" disabled={isProcessing} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-indigo-300 flex items-center justify-center w-24">
                            {isProcessing ? <Spinner size="sm" /> : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- CONFIRMATION MODAL ---
const ConfirmationModal: React.FC<{
    title: string; message: string; confirmText: string; onConfirm: () => void;
    onCancel: () => void; isLoading: boolean;
}> = ({ title, message, confirmText, onConfirm, onCancel, isLoading }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 text-gray-200 rounded-lg w-full max-w-sm text-center p-6 shadow-lg animate-scale-in">
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="flex justify-center gap-4">
                <button onClick={onCancel} disabled={isLoading} className="px-6 py-2 bg-gray-600 text-gray-200 rounded-md font-semibold">إلغاء</button>
                <button onClick={onConfirm} disabled={isLoading} className="px-6 py-2 bg-red-500 text-white rounded-md font-semibold w-24 flex justify-center items-center disabled:bg-red-300">
                    {isLoading ? <Spinner size="sm" /> : confirmText}
                </button>
            </div>
        </div>
    </div>
);


// --- NOTIFICATIONS TAB ---
const NotificationsTab: React.FC<{ onAction: () => void }> = ({ onAction }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetUser, setTargetUser] = useState(''); // Phone number
    const [isSending, setIsSending] = useState(false);

    const handleSend = () => {
        if (!title.trim() || !message.trim()) {
            showToast('Title and message cannot be empty.');
            return;
        }
        setIsSending(true);
        try {
            const users = db.getAllUsers();
            const usersToNotify = targetUser.trim() ? users.filter(u => u.phone === targetUser.trim()) : users;
            
            if (usersToNotify.length === 0) {
                showToast(targetUser.trim() ? 'User not found.' : 'No users to notify.');
                return;
            }

            usersToNotify.forEach(user => {
                user.notifications.unshift({
                    id: crypto.randomUUID(),
                    title,
                    message,
                    timestamp: Date.now(),
                    read: false,
                });
                db.saveUser(user);
            });
            showToast(`Notification sent to ${usersToNotify.length} user(s).`);
            setTitle('');
            setMessage('');
            setTargetUser('');
            onAction();
        } catch (e) {
             showToast(e instanceof Error ? e.message : 'An error occurred');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow space-y-4 text-right">
            <div>
                <label className="block font-bold text-sm mb-1 text-gray-200">العنوان</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white" />
            </div>
            <div>
                <label className="block font-bold text-sm mb-1 text-gray-200">الرسالة</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white" />
            </div>
             <div>
                <label className="block font-bold text-sm mb-1 text-gray-200">رقم هاتف المستخدم المستهدف</label>
                <input type="text" value={targetUser} onChange={e => setTargetUser(e.target.value)} placeholder="اتركه فارغًا للإرسال للجميع" className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white placeholder-gray-400" />
                 <p className="text-xs text-gray-400 mt-1">اتركه فارغًا للإرسال إلى جميع المستخدمين. سيؤدي تحديد رقم هاتف إلى إرسال الإشعار إلى هذا المستخدم فقط.</p>
            </div>
            <button onClick={handleSend} disabled={isSending} className="w-full bg-indigo-500 text-white p-3 rounded-md font-bold disabled:bg-indigo-300 flex justify-center items-center">
                {isSending ? <Spinner /> : 'إرسال الإشعار'}
            </button>
        </div>
    );
};

// --- CONTENT TAB ---
const ContentTab: React.FC<{ config: SiteConfig; updateConfig: (newConfig: SiteConfig) => void }> = ({ config, updateConfig }) => {
    const [localConfig, setLocalConfig] = useState(config);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    const handleSave = () => {
        setIsSaving(true);
        updateConfig(localConfig);
        setTimeout(() => {
            showToast('Content updated successfully!');
            setIsSaving(false);
        }, 500);
    };

    const handleBannerChange = (index: number, field: keyof Banner, value: string) => {
        const newBanners = [...localConfig.banners];
        newBanners[index] = { ...newBanners[index], [field]: value };
        setLocalConfig(prev => ({ ...prev, banners: newBanners }));
    };

    const addBanner = () => {
        const newBanner: Banner = { id: crypto.randomUUID(), imageUrl: '', link: '' };
        setLocalConfig(prev => ({ ...prev, banners: [...prev.banners, newBanner] }));
    };

    const removeBanner = (id: string) => {
        setLocalConfig(prev => ({ ...prev, banners: prev.banners.filter(b => b.id !== id) }));
    };
    
    // Similar handlers for links and promo codes
    const handleLinkChange = (index: number, field: keyof CustomerServiceLink, value: string) => {
        const newLinks = [...localConfig.customerServiceLinks];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setLocalConfig(prev => ({ ...prev, customerServiceLinks: newLinks }));
    };
    const addLink = () => {
        const newLink: CustomerServiceLink = { id: crypto.randomUUID(), name: '', link: '' };
        setLocalConfig(prev => ({...prev, customerServiceLinks: [...prev.customerServiceLinks, newLink]}));
    }
    const removeLink = (id: string) => {
         setLocalConfig(prev => ({...prev, customerServiceLinks: prev.customerServiceLinks.filter(l => l.id !== id)}));
    }

    const handlePromoCodeChange = (index: number, field: keyof PromoCode, value: string | number) => {
        const newCodes = [...localConfig.promoCodes];
        newCodes[index] = { ...newCodes[index], [field]: value };
        setLocalConfig(prev => ({ ...prev, promoCodes: newCodes }));
    };
     const addPromoCode = () => {
        const newCode: PromoCode = { id: crypto.randomUUID(), code: '', bonusAmount: 50, usesLeft: 100 };
        setLocalConfig(prev => ({...prev, promoCodes: [...prev.promoCodes, newCode]}));
    }
    const removePromoCode = (id: string) => {
         setLocalConfig(prev => ({...prev, promoCodes: prev.promoCodes.filter(c => c.id !== id)}));
    }

    return (
        <div className="space-y-6">
            <AdminSection title="محتوى الصفحة">
                <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-200">محتوى "معلومات عنا"</label>
                    <textarea value={localConfig.aboutUsContent} onChange={e => setLocalConfig(prev => ({...prev, aboutUsContent: e.target.value}))} rows={8} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white" />
                </div>
                 <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-200">محتوى "قواعد المنصة"</label>
                    <textarea value={localConfig.platformRulesContent} onChange={e => setLocalConfig(prev => ({...prev, platformRulesContent: e.target.value}))} rows={8} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white" />
                </div>
            </AdminSection>

            <AdminSection title="إدارة البانرات">
                {localConfig.banners.map((banner, index) => (
                    <div key={banner.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                        <input type="text" placeholder="رابط الصورة" value={banner.imageUrl} onChange={e => handleBannerChange(index, 'imageUrl', e.target.value)} className="w-full p-2 border rounded-md md:col-span-2 bg-gray-700 border-gray-600 text-white" />
                        <input type="text" placeholder="رابط الوجهة" value={banner.link} onChange={e => handleBannerChange(index, 'link', e.target.value)} className="w-full p-2 border rounded-md md:col-span-2 bg-gray-700 border-gray-600 text-white" />
                        <button onClick={() => removeBanner(banner.id)} className="bg-red-500/20 text-red-400 p-2 rounded-md"><Trash2Icon className="w-5 h-5 mx-auto"/></button>
                    </div>
                ))}
                <button onClick={addBanner} className="text-indigo-400 font-semibold mt-2 text-sm">+ إضافة بانر جديد</button>
            </AdminSection>

            <AdminSection title="إدارة روابط الدعم">
                 {localConfig.customerServiceLinks.map((link, index) => (
                    <div key={link.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                        <input type="text" placeholder="اسم الرابط" value={link.name} onChange={e => handleLinkChange(index, 'name', e.target.value)} className="w-full p-2 border rounded-md md:col-span-2 bg-gray-700 border-gray-600 text-white" />
                        <input type="text" placeholder="URL" value={link.link} onChange={e => handleLinkChange(index, 'link', e.target.value)} className="w-full p-2 border rounded-md md:col-span-2 bg-gray-700 border-gray-600 text-white" />
                        <button onClick={() => removeLink(link.id)} className="bg-red-500/20 text-red-400 p-2 rounded-md"><Trash2Icon className="w-5 h-5 mx-auto"/></button>
                    </div>
                ))}
                 <button onClick={addLink} className="text-indigo-400 font-semibold mt-2 text-sm">+ إضافة رابط جديد</button>
            </AdminSection>

            <AdminSection title="إدارة أكواد الخصم">
                {localConfig.promoCodes.map((code, index) => (
                    <div key={code.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                        <input type="text" placeholder="الكود" value={code.code} onChange={e => handlePromoCodeChange(index, 'code', e.target.value.toUpperCase())} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white"/>
                        <input type="number" placeholder="مبلغ المكافأة" value={code.bonusAmount} onChange={e => handlePromoCodeChange(index, 'bonusAmount', Number(e.target.value))} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white"/>
                        <input type="number" placeholder="الاستخدامات المتبقية" value={code.usesLeft} onChange={e => handlePromoCodeChange(index, 'usesLeft', Number(e.target.value))} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white"/>
                        <div/>
                        <button onClick={() => removePromoCode(code.id)} className="bg-red-500/20 text-red-400 p-2 rounded-md"><Trash2Icon className="w-5 h-5 mx-auto"/></button>
                    </div>
                ))}
                 <button onClick={addPromoCode} className="text-indigo-400 font-semibold mt-2 text-sm">+ إضافة كود جديد</button>
            </AdminSection>

             <AdminSection title="صور الموقع">
                 <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-200">رأس الصفحة الرئيسية</label>
                    <input type="text" value={localConfig.siteImages.homeHeader} onChange={e => setLocalConfig(prev => ({ ...prev, siteImages: { ...prev.siteImages, homeHeader: e.target.value } }))} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white"/>
                 </div>
            </AdminSection>
            
            <button onClick={handleSave} disabled={isSaving} className="w-full bg-indigo-600 text-white p-3 rounded-md font-bold disabled:bg-indigo-300 flex justify-center items-center">
                {isSaving ? <Spinner /> : 'حفظ تغييرات المحتوى'}
            </button>
        </div>
    );
};

// --- SETTINGS TAB ---
const SettingsTab: React.FC<{ config: SiteConfig, updateConfig: (newConfig: SiteConfig) => void }> = ({ config, updateConfig }) => {
    const [settings, setSettings] = useState(config);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setSettings(config);
    }, [config]);

    const handleSave = () => {
        setIsSaving(true);
        updateConfig(settings);
        setTimeout(() => {
            showToast('Settings saved successfully!');
            setIsSaving(false);
        }, 500);
    };

    const formatHour = (hour: number) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour % 12 || 12;
        return { hour: h12, period };
    };

    const parseHour = (hour12: string | number, period: string) => {
        let hour24 = Number(hour12);
        if (period === 'PM' && hour24 < 12) hour24 += 12;
        if (period === 'AM' && hour24 === 12) hour24 = 0; // Midnight case
        return hour24;
    };

    const handleTimeChange = (type: 'start' | 'end', part: 'hour' | 'period', value: string) => {
        const { startHour, endHour } = settings.withdrawalSettings;
        const currentFormatted = type === 'start' ? formatHour(startHour) : formatHour(endHour);
        
        const newHourStr = part === 'hour' ? value : currentFormatted.hour.toString();
        const newPeriod = part === 'period' ? value : currentFormatted.period;
        
        const hour24 = parseHour(newHourStr, newPeriod);

        setSettings(prev => ({
            ...prev,
            withdrawalSettings: {
                ...prev.withdrawalSettings,
                [type === 'start' ? 'startHour' : 'endHour']: hour24
            }
        }));
    };

    const startFormatted = formatHour(settings.withdrawalSettings.startHour);
    const endFormatted = formatHour(settings.withdrawalSettings.endHour);

    return (
        <div className="space-y-6">
            <AdminSection title="إعدادات السحب">
                <div className="space-y-4">
                    <div className="flex items-center justify-end">
                        <label htmlFor="is24Hour" className="font-semibold ml-3 text-gray-200">تمكين السحب على مدار 24 ساعة</label>
                        <input
                            type="checkbox"
                            id="is24Hour"
                            checked={settings.withdrawalSettings.is24Hour}
                            onChange={(e) => setSettings(p => ({ ...p, withdrawalSettings: { ...p.withdrawalSettings, is24Hour: e.target.checked } }))}
                            className="w-5 h-5"
                        />
                    </div>
                    <p className="text-xs text-gray-400 -mt-2">قم بتعيين ساعات عمل عمليات السحب. عند تمكين خيار 24 ساعة، يمكن للمستخدمين السحب في أي وقت.</p>
                    {!settings.withdrawalSettings.is24Hour && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-200">وقت البدء</label>
                                <div className="flex gap-2">
                                    <select value={startFormatted.hour} onChange={e => handleTimeChange('start', 'hour', e.target.value)} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white">
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                    <select value={startFormatted.period} onChange={e => handleTimeChange('start', 'period', e.target.value)} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white">
                                        <option value="AM">صباحًا</option>
                                        <option value="PM">مساءً</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-200">وقت الانتهاء</label>
                                 <div className="flex gap-2">
                                    <select value={endFormatted.hour} onChange={e => handleTimeChange('end', 'hour', e.target.value)} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white">
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                    <select value={endFormatted.period} onChange={e => handleTimeChange('end', 'period', e.target.value)} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white">
                                        <option value="AM">صباحًا</option>
                                        <option value="PM">مساءً</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </AdminSection>
            <AdminSection title="معلومات الدفع">
                 <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-200">محفظة المستلم</label>
                    <input 
                        type="text" 
                        value={settings.paymentInfo.receiverWallet} 
                        onChange={(e) => setSettings(p => ({ ...p, paymentInfo: { ...p.paymentInfo, receiverWallet: e.target.value } }))} 
                        className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">هذا هو رقم المحفظة الذي سيراه المستخدمون عند قيامهم بالإيداع.</p>
                 </div>
            </AdminSection>
            <button onClick={handleSave} disabled={isSaving} className="w-full bg-indigo-600 text-white p-3 rounded-md font-bold disabled:bg-indigo-300 flex justify-center items-center">
                {isSaving ? <Spinner /> : 'حفظ الإعدادات'}
            </button>
        </div>
    );
};

const AdminSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow text-right">
        <h3 className="font-bold mb-3 text-lg border-b pb-2 border-gray-700 text-gray-100">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

// --- USERS TAB ---
const UsersTab: React.FC<{ users: User[], onAction: () => void }> = ({ users, onAction }) => {
    const { getProductById } = useProducts();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [modal, setModal] = useState<'details' | 'commission' | 'inviteCode' | 'wallet' | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [rates, setRates] = useState({ lv1: '', lv2: '', lv3: '' });
    const [newInviteCode, setNewInviteCode] = useState('');
    
    // State for user actions
    const [targetPhone, setTargetPhone] = useState('');
    const [adjAmount, setAdjAmount] = useState('');
    const [adjType, setAdjType] = useState<'add' | 'subtract'>('add');
    const [newPassword, setNewPassword] = useState('');
    

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        const query = searchQuery.trim().toLowerCase();
        return users.filter(u => 
            u.phone.includes(query) || 
            u.inviteCode.toLowerCase().includes(query)
        );
    }, [users, searchQuery]);

    const handleViewDetails = (user: User) => {
        setSelectedUser(user);
        setModal('details');
    };

    const handleEditCommission = (user: User) => {
        setSelectedUser(user);
        setRates({
            lv1: user.commissionRates?.lv1?.toString() || '',
            lv2: user.commissionRates?.lv2?.toString() || '',
            lv3: user.commissionRates?.lv3?.toString() || '',
        });
        setModal('commission');
    };

    const handleEditInviteCode = (user: User) => {
        setSelectedUser(user);
        setNewInviteCode(user.inviteCode);
        setModal('inviteCode');
    };

    const handleEditWallet = (user: User) => {
        setSelectedUser(user);
        setModal('wallet');
    };
    
    const handleAdjustBalance = () => {
        const amount = parseFloat(adjAmount);
        if (!targetPhone.trim() || isNaN(amount) || amount <= 0) {
            showToast("يرجى تقديم رقم هاتف ومبلغ صالحين.");
            return;
        }
        const user = db.findUserByPhone(targetPhone.trim());
        if (!user) {
            showToast("المستخدم غير موجود.");
            return;
        }

        const signedAmount = adjType === 'add' ? amount : -amount;
        user.balance += signedAmount;

        user.transactions.unshift({
            id: crypto.randomUUID(),
            type: adjType === 'add' ? 'reward' : 'purchase',
            description: adjType === 'add' ? 'رصيد إداري مضاف' : 'خصم رصيد إداري',
            amount: signedAmount,
            timestamp: Date.now(),
            status: 'completed'
        });
        db.saveUser(user);
        showToast(`تم تعديل رصيد ${user.phone} بنجاح.`);
        onAction();
        setTargetPhone('');
        setAdjAmount('');
    };

    const handleResetPassword = () => {
        if (!targetPhone.trim() || !newPassword.trim()) {
            showToast("يرجى تقديم رقم هاتف وكلمة مرور جديدة.");
            return;
        }
        if (newPassword.length < 6) {
            showToast("يجب أن تكون كلمة المرور 6 أحرف على الأقل.");
            return;
        }
        const user = db.findUserByPhone(targetPhone.trim());
        if (!user) {
            showToast("المستخدم غير موجود.");
            return;
        }
        user.password = newPassword;
        db.saveUser(user);
        showToast(`تم إعادة تعيين كلمة مرور ${user.phone} بنجاح.`);
        onAction();
        setTargetPhone('');
        setNewPassword('');
    };

    const handleToggleBlock = (userPhone: string) => {
        const user = db.findUserByPhone(userPhone);
        if (user) {
            user.isBlocked = !user.isBlocked;
            db.saveUser(user);
            showToast(user.isBlocked ? 'تم حظر المستخدم.' : 'تم إلغاء حظر المستخدم.');
            onAction();
        }
    };
    
    const handleSaveCommission = () => {
        if (!selectedUser) return;
        setIsProcessing(true);
        
        const userToUpdate = db.findUserByPhone(selectedUser.phone);
        if (userToUpdate) {
            const newRates = {
                lv1: parseFloat(rates.lv1) || 0,
                lv2: parseFloat(rates.lv2) || 0,
                lv3: parseFloat(rates.lv3) || 0,
            };
            userToUpdate.commissionRates = (newRates.lv1 > 0 || newRates.lv2 > 0 || newRates.lv3 > 0) ? newRates : undefined;
            db.saveUser(userToUpdate);
            showToast('تم تحديث العمولات.');
            onAction();
        }
        setIsProcessing(false);
        setModal(null);
    };

    const handleSaveInviteCode = () => {
        if (!selectedUser) return;
        
        const normalizedCode = newInviteCode.trim().toUpperCase();
        if (!normalizedCode) {
            showToast('كود الدعوة لا يمكن أن يكون فارغًا.');
            return;
        }

        const existingUser = db.findUserByInviteCode(normalizedCode);
        if (existingUser && existingUser.phone !== selectedUser.phone) {
            showToast('كود الدعوة هذا مستخدم بالفعل.');
            return;
        }

        setIsProcessing(true);
        const userToUpdate = db.findUserByPhone(selectedUser.phone);
        if (userToUpdate) {
            userToUpdate.inviteCode = normalizedCode;
            db.saveUser(userToUpdate);
            showToast('تم تحديث كود الدعوة بنجاح.');
            onAction();
        }
        setIsProcessing(false);
        setModal(null);
    };

    return (
        <div className="space-y-4">
            <AdminSection title="إجراءات المستخدم">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <form onSubmit={(e) => { e.preventDefault(); handleAdjustBalance(); }} className="space-y-2">
                        <h4 className="font-semibold mb-2 text-gray-200">تعديل الرصيد</h4>
                        <input type="text" value={targetPhone} onChange={e => setTargetPhone(e.target.value)} placeholder="رقم هاتف المستخدم" className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white" />
                        <input type="number" value={adjAmount} onChange={e => setAdjAmount(e.target.value)} placeholder="المبلغ" className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white" />
                        <div className="flex gap-4 text-gray-300">
                            <label><input type="radio" value="add" checked={adjType === 'add'} onChange={() => setAdjType('add')} /> إضافة</label>
                            <label><input type="radio" value="subtract" checked={adjType === 'subtract'} onChange={() => setAdjType('subtract')} /> خصم</label>
                        </div>
                        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded-md font-semibold">تأكيد</button>
                    </form>
                    <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }} className="space-y-2">
                         <h4 className="font-semibold mb-2 text-gray-200">إعادة تعيين كلمة المرور</h4>
                        <input type="text" value={targetPhone} onChange={e => setTargetPhone(e.target.value)} placeholder="رقم هاتف المستخدم" className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white" />
                        <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="كلمة المرور الجديدة" className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white" />
                         <div className="h-[36px]"></div>
                        <button type="submit" className="w-full p-2 bg-orange-500 text-white rounded-md font-semibold">إعادة تعيين</button>
                    </form>
                </div>
            </AdminSection>

            <AdminSection title={`قائمة المستخدمين (${users.length})`}>
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن طريق رقم الهاتف أو المعرف"
                        className="w-full p-2 border rounded-md pr-10 bg-gray-700 border-gray-600 text-white"
                    />
                    <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                </div>
            </AdminSection>

            <div className="space-y-2">
                {filteredUsers.map(user => (
                    <div key={user.phone} className="bg-gray-800 p-3 rounded-lg shadow text-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-100">{user.phone} <span className="text-xs text-gray-400">({user.inviteCode})</span></p>
                                <p className="text-xs text-gray-400">الرصيد: {user.balance.toFixed(2)}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${user.isBlocked ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                {user.isBlocked ? 'محظور' : 'نشط'}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2 border-t border-gray-700 pt-2">
                            <button onClick={() => handleViewDetails(user)} className="text-xs bg-blue-500/20 text-blue-300 p-1.5 rounded font-semibold">التفاصيل</button>
                            <button onClick={() => handleToggleBlock(user.phone)} className={`text-xs p-1.5 rounded font-semibold ${user.isBlocked ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-600 text-gray-300'}`}>{user.isBlocked ? 'إلغاء الحظر' : 'حظر'}</button>
                            <button onClick={() => handleEditCommission(user)} className="text-xs bg-purple-500/20 text-purple-300 p-1.5 rounded font-semibold">العمولات</button>
                            <button onClick={() => handleEditInviteCode(user)} className="text-xs bg-teal-500/20 text-teal-300 p-1.5 rounded font-semibold">تغيير الكود</button>
                             <button onClick={() => handleEditWallet(user)} className="text-xs bg-orange-500/20 text-orange-300 p-1.5 rounded font-semibold">المحفظة</button>
                        </div>
                    </div>
                ))}
            </div>

            {modal === 'details' && selectedUser && <UserDetailsModal user={selectedUser} onClose={() => setModal(null)} getProductById={getProductById} />}
            {modal === 'commission' && selectedUser && <CommissionEditModal user={selectedUser} rates={rates} setRates={setRates} onSave={handleSaveCommission} onClose={() => setModal(null)} isProcessing={isProcessing} />}
            {modal === 'inviteCode' && selectedUser && <InviteCodeEditModal user={selectedUser} newCode={newInviteCode} setNewCode={setNewInviteCode} onSave={handleSaveInviteCode} onClose={() => setModal(null)} isProcessing={isProcessing} />}
            {modal === 'wallet' && selectedUser && <WalletEditModal user={selectedUser} onClose={() => setModal(null)} onAction={onAction} />}
        </div>
    );
};

const UserDetailsModal: React.FC<{user: User, onClose:()=>void, getProductById: (id:number) => Product | undefined}> = ({ user, onClose, getProductById }) => {
    const renderReferrals = (level: 'lv1' | 'lv2' | 'lv3') => {
        const team = user.team[level];
        return (
            <div>
                <h5 className="font-semibold text-sm text-gray-200">المستوى {level.replace('lv', '')} ({team.length})</h5>
                {team.length > 0 ? (
                    <div className="text-xs text-gray-400 pl-2 max-h-24 overflow-y-auto">
                        {team.join(', ')}
                    </div>
                ) : <p className="text-xs text-gray-400">لا يوجد</p>}
            </div>
        )
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 text-gray-200 rounded-lg w-full max-w-lg shadow-lg animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800">
                     <h3 className="font-bold text-lg text-gray-100">تفاصيل المستخدم: {user.phone}</h3>
                     <button onClick={onClose}><XCircleIcon className="w-6 h-6 text-gray-400"/></button>
                </div>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-gray-700 p-2 rounded-md"><p className="text-xs">الرصيد</p><p className="font-bold">{user.balance.toFixed(2)}</p></div>
                        <div className="bg-gray-700 p-2 rounded-md"><p className="text-xs">إجمالي الإيرادات</p><p className="font-bold">{user.totalRevenue.toFixed(2)}</p></div>
                        <div className="bg-gray-700 p-2 rounded-md"><p className="text-xs">الداعي</p><p className="font-bold">{user.referrer || 'لا يوجد'}</p></div>
                        <div className="bg-gray-700 p-2 rounded-md"><p className="text-xs">كود التسجيل</p><p className="font-bold">{user.registrationInviteCode || 'لا يوجد'}</p></div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2 text-gray-100">فريق الإحالة</h4>
                        <div className="space-y-2 border border-gray-700 p-2 rounded-md">
                            {renderReferrals('lv1')}
                            {renderReferrals('lv2')}
                            {renderReferrals('lv3')}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2 text-gray-100">المنتجات المشتراة ({user.purchasedProducts.length})</h4>
                        <div className="max-h-32 overflow-y-auto border border-gray-700 rounded-md p-2 space-y-2">
                            {user.purchasedProducts.map(pp => {
                                const product = getProductById(pp.productId);
                                return (
                                <div key={pp.id} className="text-xs border-b border-gray-700 pb-1">
                                    <p>{product?.title || `Product ID: ${pp.productId}`}</p>
                                    <p className="text-gray-400">تاريخ الشراء: {new Date(pp.purchaseDate).toLocaleDateString()}</p>
                                </div>
                            )})}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-bold mb-2 text-gray-100">سجل المعاملات ({user.transactions.length})</h4>
                        <div className="max-h-32 overflow-y-auto border border-gray-700 rounded-md p-2 space-y-2">
                             {user.transactions.map(tx => (
                                <div key={tx.id} className="text-xs border-b border-gray-700 pb-1">
                                    <p>{tx.description} <span className={`font-mono ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>{tx.amount.toFixed(2)}</span></p>
                                    <p className="text-gray-400">{new Date(tx.timestamp).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const CommissionEditModal: React.FC<{
    user: User;
    rates: { lv1: string; lv2: string; lv3: string; };
    setRates: (rates: { lv1: string; lv2: string; lv3: string; }) => void;
    onSave: () => void;
    onClose: () => void;
    isProcessing: boolean;
}> = ({ user, rates, setRates, onSave, onClose, isProcessing }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 text-gray-200 rounded-lg w-full max-w-sm shadow-lg animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className="font-bold text-lg text-gray-100 text-right">تعديل العمولة: {user.phone}</h3>
                </div>
                <div className="p-4 space-y-4 text-right">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-200">معدل المستوى 1 (مثال: 0.35 لـ 35%)</label>
                        <input type="number" step="0.01" value={rates.lv1} onChange={e => setRates({ ...rates, lv1: e.target.value })} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-200">معدل المستوى 2 (مثال: 0.02 لـ 2%)</label>
                        <input type="number" step="0.01" value={rates.lv2} onChange={e => setRates({ ...rates, lv2: e.target.value })} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-200">معدل المستوى 3 (مثال: 0.01 لـ 1%)</label>
                        <input type="number" step="0.01" value={rates.lv3} onChange={e => setRates({ ...rates, lv3: e.target.value })} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white" />
                    </div>
                </div>
                <div className="p-4 flex justify-end gap-3 bg-gray-800/50">
                    <button onClick={onClose} className="bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-lg">إلغاء</button>
                    <button onClick={onSave} disabled={isProcessing} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-indigo-300 flex items-center justify-center w-24">
                        {isProcessing ? <Spinner size="sm" /> : 'حفظ'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const InviteCodeEditModal: React.FC<{
    user: User;
    newCode: string;
    setNewCode: (code: string) => void;
    onSave: () => void;
    onClose: () => void;
    isProcessing: boolean;
}> = ({ user, newCode, setNewCode, onSave, onClose, isProcessing }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 text-gray-200 rounded-lg w-full max-w-sm shadow-lg animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className="font-bold text-lg text-gray-100 text-right">تغيير كود الدعوة: {user.phone}</h3>
                </div>
                <div className="p-4 space-y-4 text-right">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-200">كود الدعوة الجديد</label>
                        <input type="text" value={newCode} onChange={e => setNewCode(e.target.value)} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white tracking-widest" />
                    </div>
                </div>
                <div className="p-4 flex justify-end gap-3 bg-gray-800/50">
                    <button onClick={onClose} className="bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-lg">إلغاء</button>
                    <button onClick={onSave} disabled={isProcessing} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-indigo-300 flex items-center justify-center w-24">
                        {isProcessing ? <Spinner size="sm" /> : 'حفظ'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const WalletEditModal: React.FC<{ user: User; onClose: () => void; onAction: () => void; }> = ({ user, onClose, onAction }) => {
    const { updateUserWallet } = useAuth();
    const [wallet, setWallet] = useState<WithdrawalWallet>(user.withdrawalWallet || { walletType: 'Vodafone Cash', ownerName: '', walletNumber: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setWallet(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        if (!wallet.ownerName.trim() || !wallet.walletNumber.trim()) {
            showToast('يرجى ملء جميع الحقول');
            return;
        }
        setIsProcessing(true);
        try {
            await updateUserWallet(user.phone, wallet);
            showToast('تم تحديث المحفظة بنجاح.');
            onAction();
            onClose();
        } catch (e) {
            showToast(e instanceof Error ? e.message : 'An error occurred.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 text-gray-200 rounded-lg w-full max-w-sm shadow-lg animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className="font-bold text-lg text-gray-100 text-right">تعديل محفظة: {user.phone}</h3>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-4 space-y-4 text-right">
                    <div>
                        <label className="block font-bold text-sm mb-1">نوع المحفظة</label>
                        <select name="walletType" value={wallet.walletType} onChange={handleChange} className="w-full p-3 rounded-lg border-gray-600 bg-gray-700 text-white border focus:ring-indigo-500 focus:border-indigo-500 text-right">
                            {walletOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block font-bold text-sm mb-1">اسم المالك</label>
                        <input
                            type="text"
                            name="ownerName"
                            value={wallet.ownerName}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white"
                        />
                    </div>
                    <div>
                        <label className="block font-bold text-sm mb-1">رقم المحفظة</label>
                        <input
                            type="text"
                            name="walletNumber"
                            value={wallet.walletNumber}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white"
                        />
                    </div>
                     <div className="p-4 flex justify-end gap-3 bg-gray-800/50 -m-4 mt-4">
                        <button type="button" onClick={onClose} className="bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-lg">إلغاء</button>
                        <button type="submit" disabled={isProcessing} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-indigo-300 flex items-center justify-center w-24">
                            {isProcessing ? <Spinner size="sm" /> : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- SUPPORT CHATS TAB ---
const SupportChatsTab: React.FC = () => {
    const { getAllSessions, updateSession, deleteSession } = useChat();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

    useEffect(() => {
        setSessions(getAllSessions());
    }, []);

    const handleCloseSession = (session: ChatSession) => {
        const updated = { ...session, isClosed: true, lastUpdated: Date.now() };
        updateSession(updated);
        setSessions(prev => prev.map(s => s.id === session.id ? updated : s));
        showToast(`Chat with ${session.id} closed.`);
    }

    const handleDeleteMessage = (session: ChatSession, messageId: string) => {
        const updated = {
            ...session,
            messages: session.messages.filter(m => m.id !== messageId),
            lastUpdated: Date.now()
        };
        updateSession(updated);
        setSelectedSession(updated); // Update the view immediately
        setSessions(prev => prev.map(s => s.id === session.id ? updated : s));
        showToast(`Message deleted.`);
    }

    if (selectedSession) {
        return <ChatDetailsView session={selectedSession} onBack={() => setSelectedSession(null)} onClose={handleCloseSession} onDeleteMessage={handleDeleteMessage} />;
    }

    return (
        <AdminSection title="دردشات الدعم">
            <div className="space-y-2">
                {sessions.map(session => (
                    <div key={session.id} onClick={() => setSelectedSession(session)} className="bg-gray-800 p-3 rounded-lg shadow cursor-pointer hover:bg-gray-700">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-100">{session.id}</p>
                                <p className="text-xs text-gray-400">
                                    {session.messages[session.messages.length - 1]?.text.substring(0, 40) || 'No messages yet'}...
                                </p>
                            </div>
                            <div className="text-xs text-center">
                                <span className={`px-2 py-1 rounded-full ${session.isClosed ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                    {session.isClosed ? 'مغلق' : 'مفتوح'}
                                </span>
                                <p className="text-gray-500 mt-1">{new Date(session.lastUpdated).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {sessions.length === 0 && <p className="text-center text-gray-400">لا توجد جلسات دردشة.</p>}
            </div>
        </AdminSection>
    );
}

const ChatDetailsView: React.FC<{
    session: ChatSession,
    onBack: () => void,
    onClose: (session: ChatSession) => void,
    onDeleteMessage: (session: ChatSession, messageId: string) => void
}> = ({ session, onBack, onClose, onDeleteMessage }) => {
    return (
        <div className="bg-gray-800 rounded-lg shadow">
            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                <button onClick={onBack} className="text-indigo-400 font-semibold text-sm">&lt; رجوع</button>
                <h3 className="font-bold text-gray-100">دردشة مع {session.id}</h3>
                <button onClick={() => onClose(session)} disabled={session.isClosed} className="text-red-400 font-semibold text-sm disabled:text-gray-500">إغلاق الدردشة</button>
            </div>
            <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto">
                {session.messages.map(msg => (
                    <div key={msg.id} className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-900/50' : 'bg-gray-700'}`}>
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                            <span className="font-bold">{msg.role}</span>
                            <span>{new Date(msg.timestamp).toLocaleString()}</span>
                            <button onClick={() => onDeleteMessage(session, msg.id)}><Trash2Icon className="w-3 h-3 text-red-400"/></button>
                        </div>
                        {msg.image && <img src={`data:image/jpeg;base64,${msg.image}`} alt="upload" className="max-h-32 rounded-md my-1"/>}
                        <p className="text-sm text-gray-200">{msg.text}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AdminPage;