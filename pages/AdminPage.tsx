import React, { useState, useEffect, useMemo } from 'react';
import SubPageLayout from '../components/SubPageLayout';
import { User, Transaction, Product } from '../types';
import * as db from '../data/db';
import { getConfig, saveConfig, SiteConfig } from '../data/configDb';
import { showToast } from '../utils/toast';
import Spinner from '../components/Spinner';
import { useProducts } from '../hooks/useProducts';
import { productCategories } from '../data/products';
import { 
    LayoutGridIcon, ListChecksIcon, PackageIcon, BellIcon, SettingsIcon, PlusCircleIcon, PencilIcon, Trash2Icon,
    ArrowDownCircleIcon, ArrowUpCircleIcon, TrendingUpIcon, UsersIcon, ClockIcon
} from '../components/icons';

type AdminTab = 'dashboard' | 'transactions' | 'products' | 'notifications' | 'settings';

const AdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [users, setUsers] = useState<User[]>([]);
    const [config, setConfig] = useState<SiteConfig>(getConfig());
    const [isLoading, setIsLoading] = useState(true);

    const refreshData = () => {
        setIsLoading(true);
        // Use a short timeout to ensure UI updates smoothly
        setTimeout(() => {
            setUsers(db.getAllUsers());
            setConfig(getConfig());
            setIsLoading(false);
        }, 100);
    };

    useEffect(() => {
        refreshData();
    }, []);

    const TABS: { id: AdminTab; label: string; icon: React.FC<any> }[] = [
        { id: 'dashboard', label: 'الرئيسية', icon: LayoutGridIcon },
        { id: 'transactions', label: 'المعاملات', icon: ListChecksIcon },
        { id: 'products', label: 'المنتجات', icon: PackageIcon },
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
            case 'notifications':
                return <NotificationsTab onAction={refreshData} />;
            case 'settings':
                return <SettingsTab config={config} onSave={refreshData} />;
            default:
                return null;
        }
    };
    
    return (
        <SubPageLayout title="لوحة التحكم للمسؤول">
             <div className="bg-white shadow-md sticky top-14 z-10">
                <div className="flex justify-around border-b overflow-x-auto no-scrollbar">
                    {TABS.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 px-1 text-xs sm:text-sm font-semibold whitespace-nowrap flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-colors ${activeTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
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
            <div className="p-2 sm:p-4 bg-gray-100 min-h-screen">
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
        const companyProfit = totalDeposits * 0.15; // Assuming profit is withdrawal fee
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
        green: 'text-green-600 bg-green-100',
        red: 'text-red-600 bg-red-100',
        indigo: 'text-indigo-600 bg-indigo-100',
        blue: 'text-blue-600 bg-blue-100',
        yellow: 'text-yellow-600 bg-yellow-100',
    }
    return (
        <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${colors[color as keyof typeof colors]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-gray-500 text-xs font-semibold">{title}</h3>
            <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
    );
}

// --- TRANSACTIONS TAB ---
const TransactionsTab: React.FC<{ users: User[], onAction: () => void, pendingCount: number }> = ({ users, onAction, pendingCount }) => {
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

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
    
    const handleTransaction = async (userPhone: string, txId: string, action: 'approve' | 'reject') => {
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
        }
    }

    if (pendingTransactions.length === 0) {
        return <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500">لا توجد معاملات معلقة.</div>;
    }

    return (
        <div className="space-y-3">
             <h2 className="text-right font-bold">المعاملات المعلقة ({pendingCount})</h2>
            {pendingTransactions.map(({ user, transaction: tx }) => (
                <div key={tx.id} className="bg-white p-3 rounded-lg shadow text-sm">
                    <div className="flex justify-between items-center border-b pb-2 mb-2">
                        <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${tx.type === 'recharge' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {tx.type === 'recharge' ? 'إيداع' : 'سحب'}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleString('ar-EG')}</span>
                    </div>
                    <p><span className="font-semibold">المستخدم:</span> {user.phone}</p>
                    <p><span className="font-semibold">المبلغ:</span> EGP {Math.abs(tx.amount).toFixed(2)}</p>
                    {tx.type === 'withdraw' && user.withdrawalWallet && (
                         <p><span className="font-semibold">المحفظة:</span> {user.withdrawalWallet.walletNumber} ({user.withdrawalWallet.walletType})</p>
                    )}
                    <div className="flex gap-2 mt-3">
                        <button 
                            onClick={() => handleTransaction(user.phone, tx.id, 'approve')}
                            disabled={!!isProcessing}
                            className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded-md font-bold disabled:bg-gray-400 flex justify-center items-center transition-colors"
                        >
                            {isProcessing === tx.id ? <Spinner size="sm" /> : 'موافقة'}
                        </button>
                        <button 
                             onClick={() => handleTransaction(user.phone, tx.id, 'reject')}
                             disabled={!!isProcessing}
                             className="w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded-md font-bold disabled:bg-gray-400 flex justify-center items-center transition-colors"
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
                <h2 className="font-bold text-right">إدارة المنتجات ({products.length})</h2>
                <button onClick={handleAddNew} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>إضافة منتج</span>
                </button>
            </div>
            <div className="space-y-3">
                {products.map(p => (
                    <div key={p.id} className="bg-white p-3 rounded-lg shadow flex items-center gap-3">
                        <img src={p.iconUrl} alt={p.title} className="w-12 h-12 object-contain bg-gray-100 rounded-md p-1" />
                        <div className="flex-grow text-right text-sm">
                            <p className="font-bold text-gray-800">{p.title}</p>
                            <p className="text-xs text-gray-500">
                                السعر: {p.price} | الدخل: {p.dailyIncome} | الكمية: {p.totalQuantity - p.soldCount}/{p.totalQuantity}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(p)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2Icon className="w-4 h-4" /></button>
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
            <div className="bg-white rounded-lg w-full max-w-lg shadow-lg animate-scale-in text-right max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                     <h3 className="font-bold text-lg">{product ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-sm mb-1">العنوان</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded-md" required />
                        </div>
                         <div>
                            <label className="block font-semibold text-sm mb-1">الفئة</label>
                            <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full p-2 border rounded-md bg-white">
                                {productCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block font-semibold text-sm mb-1">الوصف</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md" />
                    </div>
                     <div>
                        <label className="block font-semibold text-sm mb-1">رابط الصورة</label>
                        <input type="text" name="iconUrl" value={formData.iconUrl} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="https://i.imgur.com/image.png" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <div>
                            <label className="block font-semibold text-sm mb-1">السعر</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block font-semibold text-sm mb-1">الدخل اليومي</label>
                            <input type="number" name="dailyIncome" value={formData.dailyIncome} onChange={handleChange} className="w-full p-2 border rounded-md" />
                        </div>
                         <div>
                            <label className="block font-semibold text-sm mb-1">الصلاحية (أيام)</label>
                            <input type="number" name="validity" value={formData.validity} onChange={handleChange} className="w-full p-2 border rounded-md" />
                        </div>
                         <div>
                            <label className="block font-semibold text-sm mb-1">حد الشراء</label>
                            <input type="number" name="purchaseLimit" value={formData.purchaseLimit} onChange={handleChange} className="w-full p-2 border rounded-md" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block font-semibold text-sm mb-1">الكمية الإجمالية</label>
                            <input type="number" name="totalQuantity" value={formData.totalQuantity} onChange={handleChange} className="w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block font-semibold text-sm mb-1">الكمية المباعة</label>
                            <input type="number" name="soldCount" value={formData.soldCount} onChange={handleChange} className="w-full p-2 border rounded-md" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg">إلغاء</button>
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
        <div className="bg-white rounded-lg w-full max-w-sm text-center p-6 shadow-lg animate-scale-in">
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-center gap-4">
                <button onClick={onCancel} disabled={isLoading} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md font-semibold">إلغاء</button>
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
        <div className="bg-white p-4 rounded-lg shadow space-y-4 text-right">
            <div>
                <label className="block font-bold text-sm mb-1">العنوان</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-md" />
            </div>
            <div>
                <label className="block font-bold text-sm mb-1">الرسالة</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full p-2 border rounded-md" />
            </div>
             <div>
                <label className="block font-bold text-sm mb-1">رقم هاتف المستخدم المستهدف</label>
                <input type="text" value={targetUser} onChange={e => setTargetUser(e.target.value)} placeholder="اتركه فارغًا للإرسال للجميع" className="w-full p-2 border rounded-md" />
                 <p className="text-xs text-gray-500 mt-1">اتركه فارغًا للإرسال إلى جميع المستخدمين. سيؤدي تحديد رقم هاتف إلى إرسال الإشعار إلى هذا المستخدم فقط.</p>
            </div>
            <button onClick={handleSend} disabled={isSending} className="w-full bg-indigo-500 text-white p-3 rounded-md font-bold disabled:bg-indigo-300 flex justify-center items-center">
                {isSending ? <Spinner /> : 'إرسال الإشعار'}
            </button>
        </div>
    );
};

// --- SETTINGS TAB ---
const SettingsTab: React.FC<{ config: SiteConfig, onSave: () => void }> = ({ config, onSave }) => {
    const [settings, setSettings] = useState(config);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setSettings(config);
    }, [config]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const [section, key] = name.split('.');
        
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section as keyof SiteConfig],
                [key]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
            }
        }));
    };
    
    const handleSave = () => {
        setIsSaving(true);
        saveConfig(settings);
        setTimeout(() => {
            onSave();
            showToast('Settings saved successfully!');
            setIsSaving(false);
        }, 500);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow text-right">
                <h3 className="font-bold mb-3 text-lg">إعدادات السحب</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-end">
                        <label htmlFor="is24Hour" className="font-semibold ml-3">تمكين السحب على مدار 24 ساعة</label>
                        <input type="checkbox" id="is24Hour" name="withdrawalSettings.is24Hour" checked={settings.withdrawalSettings.is24Hour} onChange={handleChange} className="w-5 h-5"/>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2">قم بتعيين ساعات عمل عمليات السحب. عند تمكين خيار 24 ساعة، يمكن للمستخدمين السحب في أي وقت.</p>
                    {!settings.withdrawalSettings.is24Hour && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">وقت البدء (0-23)</label>
                                <input type="number" name="withdrawalSettings.startHour" value={settings.withdrawalSettings.startHour} onChange={handleChange} min="0" max="23" className="w-full p-2 border rounded-md"/>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">وقت الانتهاء (0-23)</label>
                                <input type="number" name="withdrawalSettings.endHour" value={settings.withdrawalSettings.endHour} onChange={handleChange} min="0" max="23" className="w-full p-2 border rounded-md"/>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-right">
                 <h3 className="font-bold mb-3 text-lg">معلومات الدفع</h3>
                 <div>
                    <label className="block text-sm font-semibold mb-1">محفظة المستلم</label>
                    <input type="text" name="paymentInfo.receiverWallet" value={settings.paymentInfo.receiverWallet} onChange={handleChange} className="w-full p-2 border rounded-md"/>
                    <p className="text-xs text-gray-500 mt-1">هذا هو رقم المحفظة الذي سيراه المستخدمون عند قيامهم بالإيداع.</p>
                 </div>
            </div>
            <button onClick={handleSave} disabled={isSaving} className="w-full bg-indigo-500 text-white p-3 rounded-md font-bold disabled:bg-indigo-300 flex justify-center items-center">
                {isSaving ? <Spinner /> : 'حفظ الإعدادات'}
            </button>
        </div>
    );
};

export default AdminPage;