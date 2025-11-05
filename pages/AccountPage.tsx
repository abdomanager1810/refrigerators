import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { ClipboardIcon, UploadCloudIcon, DownloadCloudIcon, InfoIcon, BookOpenIcon, MessageCircleIcon, WalletIcon, BellIcon, ChevronLeftIcon, DollarSignIcon, CalendarIcon, ShieldIcon, LockIcon, PencilIcon, UserCircleIcon, EyeIcon, EyeOffIcon, SettingsIcon, GlobeIcon } from '../components/icons';
import { showToast } from '../utils/toast';
import Spinner from '../components/Spinner';
import { User } from '../types';
import { useLanguage } from '../hooks/useLanguage';

const ConfirmationModal: React.FC<{
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading: boolean;
}> = ({ title, message, confirmText, onConfirm, onCancel, isLoading }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 text-gray-200 rounded-lg w-full max-w-sm text-center p-6 shadow-lg animate-scale-in">
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-300 mb-6">{message}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onCancel} disabled={isLoading} className="px-6 py-2 bg-gray-600 text-gray-200 rounded-md">إلغاء</button>
                    <button 
                        onClick={onConfirm} 
                        disabled={isLoading}
                        className="px-6 py-2 bg-red-500 text-white rounded-md w-24 flex justify-center items-center disabled:bg-red-300"
                    >
                        {isLoading ? <Spinner size="sm" /> : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProfileEditModal: React.FC<{
    user: User;
    onClose: () => void;
    onSave: (email: string) => Promise<void>;
}> = ({ user, onClose, onSave }) => {
    const [email, setEmail] = useState(user.email || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave(email);
            showToast('تم تحديث الملف الشخصي بنجاح!');
            onClose();
        } catch (error) {
            if (error instanceof Error) showToast(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 text-gray-200 rounded-lg w-full max-w-sm p-6 shadow-lg animate-scale-in text-right" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-lg mb-4 text-center">تعديل الملف الشخصي</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-bold text-sm mb-1">البريد الإلكتروني</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="أدخل بريدك الإلكتروني"
                            className="w-full p-3 rounded-lg border-gray-600 bg-gray-700 text-white border focus:ring-indigo-500 focus:border-indigo-500 text-right"
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="w-full bg-gray-600 text-gray-200 font-bold p-3 rounded-lg">إلغاء</button>
                        <button type="submit" disabled={isLoading} className="w-full bg-indigo-500 text-white font-bold p-3 rounded-lg flex justify-center items-center disabled:bg-indigo-300">
                            {isLoading ? <Spinner /> : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TwoFactorAuthModal: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const { currentUser, generateTwoFactorSecret, confirmTwoFactorAuth, disableTwoFactorAuth } = useAuth();
    const [step, setStep] = useState<'initial' | 'setup' | 'disable'>('initial');
    const [secret, setSecret] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEnableClick = async () => {
        setIsLoading(true);
        try {
            const newSecret = await generateTwoFactorSecret();
            setSecret(newSecret);
            setStep('setup');
        } catch (e) {
            showToast('Failed to generate secret key.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmSetup = async () => {
        setIsLoading(true);
        try {
            await confirmTwoFactorAuth(totpCode);
            showToast('تم تفعيل التحقق بخطوتين بنجاح!');
            onClose();
        } catch (error) {
            if (error instanceof Error) showToast(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisable = async () => {
        setIsLoading(true);
        try {
            await disableTwoFactorAuth(totpCode);
            showToast('تم تعطيل التحقق بخطوتين بنجاح.');
            onClose();
        } catch (error) {
            if (error instanceof Error) showToast(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderInitial = () => (
        <>
            <h3 className="font-bold text-lg mb-2">حالة التحقق بخطوتين</h3>
            {currentUser?.isTwoFactorEnabled ? (
                 <div className="text-center p-4 my-4 bg-green-900/50 border border-green-500/30 rounded-lg">
                    <p className="font-semibold text-green-300">نشط</p>
                    <p className="text-xs text-green-400">حسابك محمي حاليًا.</p>
                </div>
            ) : (
                <div className="text-center p-4 my-4 bg-yellow-900/50 border border-yellow-500/30 rounded-lg">
                    <p className="font-semibold text-yellow-300">غير نشط</p>
                    <p className="text-xs text-yellow-400">حسابك غير محمي. يوصى بتفعيله.</p>
                </div>
            )}
            <div className="flex flex-col gap-2">
                {currentUser?.isTwoFactorEnabled ? (
                    <button onClick={() => setStep('disable')} className="w-full bg-red-500 text-white font-bold p-3 rounded-lg">تعطيل</button>
                ) : (
                    <button onClick={handleEnableClick} disabled={isLoading} className="w-full bg-indigo-500 text-white font-bold p-3 rounded-lg flex justify-center items-center">
                        {isLoading ? <Spinner /> : 'تفعيل'}
                    </button>
                )}
                <button onClick={onClose} className="w-full bg-gray-600 text-gray-200 font-bold p-3 rounded-lg">إغلاق</button>
            </div>
        </>
    );

    const renderSetup = () => (
        <>
            <h3 className="font-bold text-lg mb-2 text-center">تفعيل التحقق بخطوتين</h3>
            <p className="text-sm text-gray-300 mb-4 text-center leading-relaxed">أضف هذا المفتاح إلى تطبيق المصادقة الخاص بك (مثل Google Authenticator). لا يوجد رمز QR في هذا العرض التوضيحي، لذا يرجى نسخه يدويًا.</p>
            <div className="bg-gray-700 p-3 rounded-lg text-center mb-4">
                <p className="text-xs text-gray-400">المفتاح السري الخاص بك</p>
                <p className="font-mono text-lg tracking-widest text-indigo-400">{secret}</p>
            </div>
            <div className="space-y-4">
                <label className="block font-bold text-sm">أدخل الرمز المكون من 6 أرقام</label>
                <input
                    type="tel"
                    placeholder="123456"
                    value={totpCode}
                    onChange={e => setTotpCode(e.target.value)}
                    maxLength={6}
                    className="w-full p-3 rounded-lg border-gray-600 bg-gray-700 text-white border focus:ring-indigo-500 focus:border-indigo-500 text-center tracking-[.5em]"
                />
                <button onClick={handleConfirmSetup} disabled={isLoading} className="w-full bg-indigo-500 text-white font-bold p-3 rounded-lg flex justify-center items-center disabled:bg-indigo-300">
                    {isLoading ? <Spinner /> : 'تأكيد وتفعيل'}
                </button>
                <button onClick={() => setStep('initial')} className="w-full bg-gray-600 text-gray-200 font-bold p-3 rounded-lg">رجوع</button>
            </div>
        </>
    );

    const renderDisable = () => (
        <>
            <h3 className="font-bold text-lg mb-2 text-center">تعطيل التحقق بخطوتين</h3>
            <p className="text-sm text-gray-300 mb-4 text-center">لتعطيل هذه الميزة، يرجى إدخال رمز من تطبيق المصادقة الخاص بك.</p>
            <div className="space-y-4">
                <label className="block font-bold text-sm">أدخل الرمز المكون من 6 أرقام</label>
                <input
                    type="tel"
                    placeholder="123456"
                    value={totpCode}
                    onChange={e => setTotpCode(e.target.value)}
                    maxLength={6}
                    className="w-full p-3 rounded-lg border-gray-600 bg-gray-700 text-white border focus:ring-indigo-500 focus:border-indigo-500 text-center tracking-[.5em]"
                />
                <button onClick={handleDisable} disabled={isLoading} className="w-full bg-red-500 text-white font-bold p-3 rounded-lg flex justify-center items-center disabled:bg-red-300">
                     {isLoading ? <Spinner /> : 'تأكيد التعطيل'}
                </button>
                <button onClick={() => setStep('initial')} className="w-full bg-gray-600 text-gray-200 font-bold p-3 rounded-lg">رجوع</button>
            </div>
        </>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 text-gray-200 rounded-lg w-full max-w-sm p-6 shadow-lg animate-scale-in text-right" onClick={e => e.stopPropagation()}>
                {step === 'initial' && renderInitial()}
                {step === 'setup' && renderSetup()}
                {step === 'disable' && renderDisable()}
            </div>
        </div>
    );
};

const ChangePasswordModal: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const { changePassword } = useAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [visibility, setVisibility] = useState({ old: false, new: false, confirm: false });

    const toggleVisibility = (field: 'old' | 'new' | 'confirm') => {
        setVisibility(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            showToast('يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast('كلمات المرور الجديدة غير متطابقة');
            return;
        }
        setIsLoading(true);
        try {
            await changePassword(oldPassword, newPassword);
            showToast('تم تغيير كلمة المرور بنجاح!');
            onClose();
        } catch (error) {
            if (error instanceof Error) showToast(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 text-gray-200 rounded-lg w-full max-w-sm p-6 shadow-lg animate-scale-in text-right" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-lg mb-4 text-center">تغيير كلمة المرور</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-bold text-sm mb-1">كلمة المرور الحالية</label>
                        <div className="relative">
                            <input
                                type={visibility.old ? 'text' : 'password'}
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                                className="w-full p-3 rounded-lg border-gray-600 bg-gray-700 text-white border focus:ring-indigo-500 focus:border-indigo-500 text-right pl-12"
                            />
                             <button type="button" onClick={() => toggleVisibility('old')} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                {visibility.old ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block font-bold text-sm mb-1">كلمة المرور الجديدة</label>
                         <div className="relative">
                            <input
                                type={visibility.new ? 'text' : 'password'}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full p-3 rounded-lg border-gray-600 bg-gray-700 text-white border focus:ring-indigo-500 focus:border-indigo-500 text-right pl-12"
                            />
                             <button type="button" onClick={() => toggleVisibility('new')} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                {visibility.new ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block font-bold text-sm mb-1">تأكيد كلمة المرور الجديدة</label>
                        <div className="relative">
                            <input
                                type={visibility.confirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full p-3 rounded-lg border-gray-600 bg-gray-700 text-white border focus:ring-indigo-500 focus:border-indigo-500 text-right pl-12"
                            />
                             <button type="button" onClick={() => toggleVisibility('confirm')} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                {visibility.confirm ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="w-full bg-gray-600 text-gray-200 font-bold p-3 rounded-lg">إلغاء</button>
                        <button type="submit" disabled={isLoading} className="w-full bg-indigo-500 text-white font-bold p-3 rounded-lg flex justify-center items-center disabled:bg-indigo-300">
                            {isLoading ? <Spinner /> : 'حفظ التغييرات'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
};


const AccountPage: React.FC = () => {
    const { currentUser, logout, updateEmail } = useAuth();
    const { t, language, toggleLanguage } = useLanguage();
    const navigate = useNavigate();
    const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const handleLogout = () => {
        setIsLoggingOut(true);
        // Simulate a short delay for visual feedback
        setTimeout(() => {
            logout();
            navigate('/login');
            setIsLoggingOut(false);
            setIsConfirmingLogout(false);
        }, 500);
    };

    const copyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            showToast('تم النسخ!');
        });
    };
    
    const unreadCount = currentUser?.notifications?.filter(n => !n.read).length || 0;
    const chevronClass = `w-5 h-5 text-gray-500 transform ${language === 'en' ? 'scale-x-[-1]' : ''}`;

    return (
        <div className="bg-gray-800 min-h-screen">
            {isConfirmingLogout && (
                <ConfirmationModal 
                    title="تأكيد الخروج"
                    message="هل أنت متأكد أنك تريد تسجيل الخروج؟"
                    confirmText="خروج"
                    onConfirm={handleLogout}
                    onCancel={() => setIsConfirmingLogout(false)}
                    isLoading={isLoggingOut}
                />
            )}
            {show2FAModal && <TwoFactorAuthModal onClose={() => setShow2FAModal(false)} />}
            {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
            {isEditingProfile && currentUser && (
                <ProfileEditModal 
                    user={currentUser} 
                    onClose={() => setIsEditingProfile(false)}
                    onSave={updateEmail}
                />
            )}
             <header className="bg-gradient-to-b from-indigo-400 to-indigo-600 h-52 p-4 text-white relative">
                <div className="flex justify-between items-start">
                    <div className="flex items-center">
                         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center me-4 shadow-md">
                           <span className="font-bold text-indigo-500 text-lg">[R]</span>
                        </div>
                        <div className="text-start">
                             <p className="font-bold text-sm">Refrigerators</p>
                             <p className="text-sm">+20 {currentUser?.phone}</p>
                             <div className="flex items-center justify-start mt-1">
                                 <p className="text-xs bg-white/30 px-2 py-0.5 rounded-full">ID: {currentUser?.inviteCode}</p>
                                 <button onClick={() => copyToClipboard(currentUser?.inviteCode || '')} className="ms-2">
                                     <ClipboardIcon className="w-4 h-4 text-white" />
                                 </button>
                             </div>
                        </div>
                    </div>
                    <Link to="/notifications" className="relative p-2">
                        <BellIcon className="w-6 h-6" />
                        {unreadCount > 0 && (
                             <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-indigo-400"></span>
                        )}
                    </Link>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                    <div>
                        <p className="text-xs">{t('accountBalance')}</p>
                        <p className="text-2xl font-bold">EGP {currentUser?.balance.toFixed(2)}</p>
                    </div>
                     <div>
                        <p className="text-xs">{t('totalRevenue')}</p>
                        <p className="text-2xl font-bold">EGP {currentUser?.totalRevenue.toFixed(2)}</p>
                    </div>
                </div>
            </header>
            
            <main className="p-4 -mt-8 relative z-10">
                <div className="bg-gray-700 text-gray-200 rounded-xl shadow p-4 mb-4 card-enter">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-100">{t('profileInformation')}</h3>
                        <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-1 text-xs text-indigo-400 font-semibold">
                            <PencilIcon className="w-3 h-3" />
                            <span>{t('edit')}</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserCircleIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <div className="flex-grow">
                            <div className="mb-2">
                                <p className="text-xs text-gray-400">{t('username')}</p>
                                <p className="font-semibold text-gray-100">+20 {currentUser?.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">{t('email')}</p>

                                <p className="font-semibold text-gray-200 truncate">{currentUser?.email || <span className="text-gray-400 italic">{t('emailNotSet')}</span>}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-700 rounded-xl shadow p-4 text-center mb-4 card-enter">
                    <div className="flex justify-around">
                        <Link to="/recharge" className="flex flex-col items-center transition-transform hover:scale-105">
                            <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center mb-1">
                                <UploadCloudIcon className="w-6 h-6 text-indigo-400" />
                            </div>
                            <p className="text-sm text-gray-300">{t('recharge')}</p>
                        </Link>
                        <Link to="/withdraw" className="flex flex-col items-center transition-transform hover:scale-105">
                            <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center mb-1">
                                <DownloadCloudIcon className="w-6 h-6 text-indigo-400" />
                            </div>
                            <p className="text-sm text-gray-300">{t('withdraw')}</p>
                        </Link>
                    </div>
                </div>

                <div className="bg-gray-700 rounded-xl shadow overflow-hidden mb-4 card-enter" style={{ animationDelay: '100ms' }}>
                     <Link to="/records" className="flex items-center justify-between p-4 border-b border-gray-600 transition-colors hover:bg-gray-600">
                         <div className="flex items-center">
                             <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center me-3">
                                <WalletIcon className="w-5 h-5 text-indigo-400"/>
                            </div>
                            <span className="font-semibold text-gray-200">{t('balanceRecord')}</span>
                         </div>
                         <ChevronLeftIcon className={chevronClass} />
                     </Link>
                     <Link to="/my-products" className="flex items-center justify-between p-4 border-b border-gray-600 transition-colors hover:bg-gray-600">
                         <div className="flex items-center">
                             <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center me-3">
                                <DollarSignIcon className="w-5 h-5 text-indigo-400"/>
                            </div>
                            <span className="font-semibold text-gray-200">{t('myDevices')}</span>
                         </div>
                         <ChevronLeftIcon className={chevronClass} />
                     </Link>
                     <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between p-4 border-b border-gray-600 transition-colors hover:bg-gray-600">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center me-3">
                                <LockIcon className="w-5 h-5 text-indigo-400"/>
                            </div>
                            <span className="font-semibold text-gray-200">{t('changePassword')}</span>
                        </div>
                        <ChevronLeftIcon className={chevronClass} />
                     </button>
                     <button onClick={() => setShow2FAModal(true)} className="w-full flex items-center justify-between p-4 border-b border-gray-600 transition-colors hover:bg-gray-600">
                         <div className="flex items-center">
                             <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center me-3">
                                <ShieldIcon className="w-5 h-5 text-indigo-400"/>
                            </div>
                            <span className="font-semibold text-gray-200">{t('twoFactorAuth')}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${currentUser?.isTwoFactorEnabled ? 'text-green-400' : 'text-red-400'}`}>
                                {currentUser?.isTwoFactorEnabled ? t('active') : t('inactive')}
                            </span>
                            <ChevronLeftIcon className={chevronClass} />
                         </div>
                     </button>
                    {currentUser?.phone === '1141510849' &&
                        <Link to="/admin" className="flex items-center justify-between p-4 border-b border-gray-600 transition-colors hover:bg-gray-600">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center me-3">
                                    <SettingsIcon className="w-5 h-5 text-indigo-400" />
                                </div>
                                <span className="font-semibold text-gray-200">{t('adminPanel')}</span>
                            </div>
                            <ChevronLeftIcon className={chevronClass} />
                        </Link>
                    }
                     <div className="flex items-center justify-between p-4">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center me-3">
                                <CalendarIcon className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="font-semibold text-gray-200">{t('lastLogin')}</span>
                        </div>
                        <span className="text-sm text-gray-400">
                            {currentUser && new Date(currentUser.lastLogin).toLocaleString('ar-EG', {
                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                        </span>
                    </div>
                </div>
                
                <div className="bg-gray-700 rounded-xl shadow overflow-hidden mb-4 card-enter" style={{ animationDelay: '200ms' }}>
                    <Link to="/withdraw" className="flex items-center justify-between p-4 border-b border-gray-600 transition-colors hover:bg-gray-600">
                        <div className="flex items-center"><div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center me-3"><WalletIcon className="w-5 h-5 text-indigo-400" /></div><span className="font-semibold text-gray-200">{t('manageWallet')}</span></div>
                        <ChevronLeftIcon className={chevronClass} />
                    </Link>
                    <Link to="/support-chat" className="flex items-center justify-between p-4 border-b border-gray-600 transition-colors hover:bg-gray-600">
                        <div className="flex items-center"><div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center me-3"><MessageCircleIcon className="w-5 h-5 text-indigo-400" /></div><span className="font-semibold text-gray-200">الدعم المباشر بالذكاء الاصطناعي</span></div>
                        <ChevronLeftIcon className={chevronClass} />
                    </Link>
                    <Link to="/customer-service" className="flex items-center justify-between p-4 border-b border-gray-600 transition-colors hover:bg-gray-600">
                        <div className="flex items-center"><div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center me-3"><MessageCircleIcon className="w-5 h-5 text-indigo-400" /></div><span className="font-semibold text-gray-200">{t('help')}</span></div>
                        <ChevronLeftIcon className={chevronClass} />
                    </Link>
                     <Link to="/platform-rules" className="flex items-center justify-between p-4 border-b border-gray-600 transition-colors hover:bg-gray-600">
                        <div className="flex items-center"><div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center me-3"><BookOpenIcon className="w-5 h-5 text-indigo-400" /></div><span className="font-semibold text-gray-200">{t('refrigeratorRules')}</span></div>
                        <ChevronLeftIcon className={chevronClass} />
                    </Link>
                    <button onClick={toggleLanguage} className="w-full flex items-center justify-between p-4 border-b border-gray-600 transition-colors hover:bg-gray-600">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center me-3">
                                <GlobeIcon className="w-5 h-5 text-indigo-400"/>
                            </div>
                            <span className="font-semibold text-gray-200">{t('language')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-sm text-gray-400">
                                {language === 'ar' ? t('arabic') : t('english')}
                            </span>
                            <ChevronLeftIcon className={chevronClass} />
                        </div>
                    </button>
                     <Link to="/about-us" className="flex items-center justify-between p-4 transition-colors hover:bg-gray-600">
                        <div className="flex items-center"><div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center me-3"><InfoIcon className="w-5 h-5 text-indigo-400" /></div><span className="font-semibold text-gray-200">{t('aboutUs')}</span></div>
                        <ChevronLeftIcon className={chevronClass} />
                    </Link>
                </div>
                
                <div className="bg-gray-700 rounded-xl shadow p-4 mt-6 card-enter" style={{ animationDelay: '300ms' }}>
                    <button 
                        onClick={() => setIsConfirmingLogout(true)} 
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-all duration-300 ease-in-out active:scale-95"
                    >
                        {t('logout')}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default AccountPage;