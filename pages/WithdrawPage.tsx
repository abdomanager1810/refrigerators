import React, { useState } from 'react';
import SubPageLayout from '../components/SubPageLayout';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../utils/toast';
import { useNavigate } from 'react-router-dom';
import { WalletType } from '../types';
import { WalletIcon, CheckCircleIcon, EyeIcon, EyeOffIcon } from '../components/icons';
import Spinner from '../components/Spinner';
import { useSiteConfig } from '../hooks/useSiteConfig';

const walletOptions: { id: WalletType; name: string }[] = [
    { id: 'Vodafone Cash', name: 'فودافون كاش' },
    { id: 'Orange Cash', name: 'أورانج كاش' },
    { id: 'Etisalat Cash', name: 'اتصالات كاش' },
    { id: 'WE Pay', name: 'WE Pay' },
    { id: 'InstaPay', name: 'إنستا باي' },
];

const formatToAmPm = (hour: number): string => {
    const period = hour >= 12 ? 'مساءً' : 'صباحًا';
    const h12 = hour % 12 || 12;
    return `${h12}:00 ${period}`;
};

const WithdrawPage: React.FC = () => {
    const { currentUser, withdraw, linkWithdrawalWallet, setWithdrawalPassword, resetWithdrawalPassword } = useAuth();
    const { config } = useSiteConfig();
    const navigate = useNavigate();

    // Password visibility state
    const [passwordVisibility, setPasswordVisibility] = useState<Record<string, boolean>>({});
    const toggleVisibility = (field: string) => setPasswordVisibility(p => ({ ...p, [field]: !p[field] }));


    // Main withdrawal state
    const [amount, setAmount] = useState('');
    const [withdrawalPass, setWithdrawalPass] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    
    // Step 1: Link wallet
    const [selectedWalletType, setSelectedWalletType] = useState<WalletType>('Vodafone Cash');
    const [ownerName, setOwnerName] = useState('');
    const [walletNumber, setWalletNumber] = useState('');
    const [isLinking, setIsLinking] = useState(false);
    const [walletLinkedSuccess, setWalletLinkedSuccess] = useState(false);


    // Step 2: Set initial withdrawal password
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isSettingPassword, setIsSettingPassword] = useState(false);

    // Recovery flow state
    const [recoveryStep, setRecoveryStep] = useState<'idle' | 'verify' | 'reset'>('idle');
    const [totpSecret, setTotpSecret] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [newWithdrawalPassword, setNewWithdrawalPassword] = useState('');
    const [confirmNewWithdrawalPassword, setConfirmNewWithdrawalPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    const amountNum = parseFloat(amount) || 0;
    const fee = amountNum * 0.15;
    const receiveAmount = amountNum - fee;

    // A simple, dependency-free hash function to simulate TOTP generation
    const simpleHash = async (text: string): Promise<string> => {
        const buffer = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
        const view = new DataView(buffer);
        const num = view.getUint32(buffer.byteLength - 4);
        return (num % 1000000).toString().padStart(6, '0');
    };

    const handleWithdraw = async () => {
        if (amountNum <= 0) {
            showToast('الرجاء إدخال مبلغ صحيح');
            return;
        }
        if (withdrawalPass.length !== 6) {
            showToast('يجب أن تكون كلمة مرور السحب مكونة من 6 أرقام');
            return;
        }
        setIsWithdrawing(true);
        try {
            await withdraw(amountNum, withdrawalPass);
            showToast('تم طلب السحب بنجاح');
            navigate('/account');
        } catch (error) {
            if (error instanceof Error) {
                showToast(error.message);
            } else {
                showToast('An unknown error occurred.');
            }
        } finally {
            setIsWithdrawing(false);
        }
    };

    const handleLinkWallet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ownerName.trim() || !walletNumber.trim()) {
            showToast('يرجى ملء جميع الحقول');
            return;
        }
        if (!/^\d{11}$/.test(walletNumber)) {
            showToast('الرجاء إدخال رقم محفظة صحيح مكون من 11 رقمًا');
            return;
        }
        setIsLinking(true);
        try {
            await linkWithdrawalWallet({
                walletType: selectedWalletType,
                ownerName,
                walletNumber,
            });
            setWalletLinkedSuccess(true);
        } catch (error) {
            if (error instanceof Error) {
                showToast(error.message);
            } else {
                showToast('An unknown error occurred.');
            }
        } finally {
            setIsLinking(false);
        }
    };

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length !== 6 || !/^\d{6}$/.test(newPassword)) {
            showToast('يجب أن تكون كلمة المرور مكونة من 6 أرقام');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            showToast('كلمات المرور غير متطابقة');
            return;
        }
        setIsSettingPassword(true);
        try {
            await setWithdrawalPassword(newPassword);
            showToast('تم تعيين كلمة مرور السحب بنجاح');
        } catch (error) {
             if (error instanceof Error) {
                showToast(error.message);
            } else {
                showToast('An unknown error occurred.');
            }
        } finally {
            setIsSettingPassword(false);
        }
    };

    const handleForgotPassword = () => {
        // Generate a pseudo-random Base32-like secret key for the TOTP simulation
        const secret = Math.random().toString(36).substring(2, 12).toUpperCase();
        setTotpSecret(secret);
        setRecoveryStep('verify');
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
        try {
            const currentMinute = new Date().getUTCMinutes();
            const expectedCode = await simpleHash(totpSecret + currentMinute.toString());
            
            // To make the simulation more robust, also check the code from the previous minute
            const prevMinute = new Date(Date.now() - 60000).getUTCMinutes();
            const prevExpectedCode = await simpleHash(totpSecret + prevMinute.toString());
    
            if (totpCode === expectedCode || totpCode === prevExpectedCode) {
                showToast('تم التحقق بنجاح');
                setRecoveryStep('reset');
            } else {
                showToast('رمز التحقق غير صحيح');
            }
        } catch (error) {
            showToast('حدث خطأ أثناء التحقق.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newWithdrawalPassword.length !== 6 || !/^\d{6}$/.test(newWithdrawalPassword)) {
            showToast('يجب أن تكون كلمة المرور مكونة من 6 أرقام');
            return;
        }
        if (newWithdrawalPassword !== confirmNewWithdrawalPassword) {
            showToast('كلمات المرور غير متطابقة');
            return;
        }
        setIsResetting(true);
        try {
            await resetWithdrawalPassword(newWithdrawalPassword);
            showToast('تم إعادة تعيين كلمة مرور السحب بنجاح');
            setRecoveryStep('idle');
            setNewWithdrawalPassword('');
            setConfirmNewWithdrawalPassword('');
            setTotpCode('');
            setWithdrawalPass('');
        } catch (error) {
            if (error instanceof Error) showToast(error.message);
        } finally {
            setIsResetting(false);
        }
    };

    if (!currentUser) return null;

    const renderLinkWalletStep = () => (
        <div className="bg-gray-700 text-gray-200 p-4 rounded-lg shadow card-enter">
            <h2 className="text-lg font-bold mb-4 text-center">ربط محفظة السحب</h2>
            <p className="text-center text-sm text-red-400 mb-4">يمكن ربط محفظة واحدة فقط ولا يمكن تغييرها لاحقًا.</p>
            <form onSubmit={handleLinkWallet} className="space-y-4">
                <div>
                    <label className="block font-bold mb-2">اختر نوع المحفظة</label>
                    <select value={selectedWalletType} onChange={(e) => setSelectedWalletType(e.target.value as WalletType)} className="w-full p-3 rounded-lg border-gray-600 bg-gray-600 text-white border focus:ring-indigo-500 focus:border-indigo-500 text-right">
                        {walletOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block font-bold mb-2">اسم صاحب المحفظة</label>
                    <input
                        type="text"
                        placeholder="أدخل الاسم الكامل"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full p-3 rounded-lg border-gray-600 bg-gray-600 text-white border focus:ring-indigo-500 focus:border-indigo-500 text-right placeholder-gray-400"
                    />
                </div>
                <div>
                    <label className="block font-bold mb-2">رقم المحفظة</label>
                    <input
                        type="text"
                        placeholder="أدخل رقم المحفظة (11 رقمًا)"
                        value={walletNumber}
                        maxLength={11}
                        onChange={(e) => setWalletNumber(e.target.value)}
                        className="w-full p-3 rounded-lg border-gray-600 bg-gray-600 text-white border focus:ring-indigo-500 focus:border-indigo-500 text-right placeholder-gray-400"
                    />
                </div>
                <button type="submit" disabled={isLinking} className="w-full bg-indigo-500 text-white font-bold p-3 rounded-lg shadow-lg flex items-center justify-center disabled:bg-indigo-300">
                    {isLinking ? <Spinner /> : 'ربط المحفظة'}
                </button>
            </form>
        </div>
    );

    const renderWalletLinkedSuccessStep = () => (
        <div className="bg-gray-700 text-gray-200 p-6 rounded-lg shadow card-enter text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">تم ربط المحفظة بنجاح!</h2>
            <p className="text-gray-300 mb-6">محفظتك جاهزة الآن للاستخدام. الخطوة التالية هي تعيين كلمة مرور السحب الخاصة بك.</p>
            <button 
                onClick={() => setWalletLinkedSuccess(false)} 
                className="w-full bg-indigo-500 text-white font-bold p-3 rounded-lg shadow-lg"
            >
                متابعة
            </button>
        </div>
    );

    const renderSetPasswordStep = () => (
        <div className="bg-gray-700 text-gray-200 p-4 rounded-lg shadow card-enter">
            <h2 className="text-lg font-bold mb-4 text-center">تعيين كلمة مرور السحب</h2>
            <p className="text-center text-sm text-red-400 mb-4">يرجى تعيين كلمة مرور سحب مكونة من 6 أرقام. لا يمكن تغييرها بعد التعيين.</p>
            <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                    <label className="block font-bold mb-2">كلمة مرور السحب الجديدة (6 أرقام)</label>
                    <div className="relative">
                        <input
                            type={passwordVisibility['set_new'] ? 'text' : 'password'}
                            placeholder="أدخل 6 أرقام"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            maxLength={6}
                            className="w-full p-3 rounded-lg border-gray-600 bg-gray-600 text-white border focus:ring-indigo-500 focus:border-indigo-500 text-center tracking-[.5em] pl-12"
                        />
                         <button type="button" onClick={() => toggleVisibility('set_new')} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {passwordVisibility['set_new'] ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block font-bold mb-2">تأكيد كلمة المرور</label>
                    <div className="relative">
                        <input
                            type={passwordVisibility['set_confirm'] ? 'text' : 'password'}
                            placeholder="أعد إدخال 6 أرقام"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            maxLength={6}
                            className="w-full p-3 rounded-lg border-gray-600 bg-gray-600 text-white border focus:ring-indigo-500 focus:border-indigo-500 text-center tracking-[.5em] pl-12"
                        />
                        <button type="button" onClick={() => toggleVisibility('set_confirm')} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {passwordVisibility['set_confirm'] ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                <button type="submit" disabled={isSettingPassword} className="w-full bg-indigo-500 text-white font-bold p-3 rounded-lg shadow-lg flex items-center justify-center disabled:bg-indigo-300">
                    {isSettingPassword ? <Spinner /> : 'تعيين كلمة المرور'}
                </button>
            </form>
        </div>
    );

    const renderWithdrawStep = () => {
        const { is24Hour, startHour, endHour } = config.withdrawalSettings;
        return (
            <>
                <div className="bg-gray-700 text-gray-200 p-4 rounded-lg shadow card-enter">
                    <p className="text-gray-400 text-sm">المحفظة المرتبطة</p>
                    <div className="flex items-center justify-end mt-2">
                        <div className="text-right">
                            <p className="font-bold text-gray-100">{currentUser.withdrawalWallet.ownerName} ({currentUser.withdrawalWallet.walletType})</p>
                            <p className="text-gray-300 font-mono">{currentUser.withdrawalWallet.walletNumber}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center ml-4">
                            <WalletIcon className="w-6 h-6 text-indigo-400" />
                        </div>
                    </div>
                </div>
    
                <div className="bg-gray-700 text-gray-200 p-4 rounded-lg shadow card-enter" style={{ animationDelay: '100ms' }}>
                    <p className="text-gray-400 text-sm">الرصيد القابل للسحب</p>
                    <p className="text-3xl font-bold text-gray-100">EGP {currentUser.balance.toFixed(2)}</p>
                </div>
    
                <div className="card-enter" style={{ animationDelay: '200ms' }}>
                    <label htmlFor="amount" className="block font-bold mb-2">مبلغ السحب</label>
                    <div className="relative">
                        <input
                            id="amount"
                            type="number"
                            placeholder="أدخل المبلغ (100 - 60000)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-4 rounded-lg border-gray-600 bg-gray-700 text-white border focus:ring-indigo-500 focus:border-indigo-500 text-right pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">EGP</span>
                    </div>
                </div>
                <div className="card-enter" style={{ animationDelay: '300ms' }}>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block font-bold">كلمة مرور السحب (6 أرقام)</label>
                        <button onClick={handleForgotPassword} className="text-xs text-indigo-400 hover:underline">هل نسيت كلمة المرور؟</button>
                    </div>
                    <div className="relative">
                        <input
                            type={passwordVisibility['withdraw'] ? 'text' : 'password'}
                            placeholder="أدخل كلمة مرور السحب"
                            value={withdrawalPass}
                            onChange={(e) => setWithdrawalPass(e.target.value)}
                            maxLength={6}
                            className="w-full p-3 rounded-lg border-gray-600 bg-gray-700 text-white border focus:ring-indigo-500 focus:border-indigo-500 text-center tracking-[.5em] pl-12"
                        />
                        <button type="button" onClick={() => toggleVisibility('withdraw')} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {passwordVisibility['withdraw'] ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
    
                <div className="bg-gray-700 text-gray-300 p-4 rounded-lg shadow space-y-2 text-sm card-enter" style={{ animationDelay: '400ms' }}>
                    <div className="flex justify-between">
                        <span className="text-gray-400">مبلغ السحب:</span>
                        <span>EGP {amountNum.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">رسوم السحب (15%):</span>
                        <span>EGP {fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-100">
                        <span>المبلغ المستلم:</span>
                        <span>EGP {receiveAmount.toFixed(2)}</span>
                    </div>
                </div>
    
                <button onClick={handleWithdraw} disabled={isWithdrawing} className="w-full bg-indigo-500 text-white font-bold p-3 rounded-lg shadow-lg flex items-center justify-center disabled:bg-indigo-300 card-enter" style={{ animationDelay: '500ms' }}>
                    {isWithdrawing ? <Spinner /> : 'تأكيد السحب'}
                </button>
                 
                <div className="text-xs text-gray-400 space-y-1 card-enter" style={{ animationDelay: '600ms' }}>
                    <h3 className="font-bold text-sm text-gray-300">تعليمات السحب:</h3>
                    <p>1. الحد الأدنى لمبلغ السحب الواحد هو 100 جنيه مصري والحد الأقصى 60000 جنيه مصري.</p>
                    <p>2. سيتم خصم رسوم سحب بنسبة 15% من مبلغ السحب.</p>
                    <p>3. وقت وصول السحب عادة ما يكون في غضون 24 ساعة.</p>
                    <p>4. أوقات السحب المتاحة هي {is24Hour ? '24 ساعة' : `من ${formatToAmPm(startHour)} إلى ${formatToAmPm(endHour)}`} (بتوقيت مصر).</p>
                </div>
            </>
        );
    }

    const renderVerifyStep = () => (
        <div className="bg-gray-700 text-gray-200 p-4 rounded-lg shadow card-enter">
            <h2 className="text-lg font-bold mb-2 text-center">إعادة تعيين كلمة مرور السحب</h2>
            <p className="text-center text-sm text-gray-300 mb-4 leading-relaxed">لتحسين الأمان، نستخدم كلمات مرور لمرة واحدة تعتمد على الوقت (TOTP). يرجى إضافة المفتاح السري التالي إلى تطبيق المصادقة الخاص بك (مثل Google Authenticator).</p>
            
            <div className="bg-gray-800 p-3 rounded-lg text-center mb-4">
                <p className="text-xs text-gray-400">المفتاح السري الخاص بك</p>
                <p className="font-mono text-lg tracking-widest text-indigo-400">{totpSecret}</p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                    <label className="block font-bold mb-2">رمز التحقق (6 أرقام)</label>
                    <input
                        type="text"
                        placeholder="أدخل 6 أرقام من تطبيقك"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value)}
                        maxLength={6}
                        className="w-full p-3 rounded-lg border-gray-600 bg-gray-600 text-white border focus:ring-indigo-500 focus:border-indigo-500 text-center tracking-[.5em]"
                    />
                </div>
                <button type="submit" disabled={isVerifying} className="w-full bg-indigo-500 text-white font-bold p-3 rounded-lg shadow-lg flex items-center justify-center disabled:bg-indigo-300">
                    {isVerifying ? <Spinner /> : 'التحقق والمتابعة'}
                </button>
                <button type="button" onClick={() => setRecoveryStep('idle')} className="w-full bg-gray-600 text-gray-200 font-bold p-3 rounded-lg">
                    إلغاء
                </button>
            </form>
        </div>
    );

    const renderResetStep = () => (
        <div className="bg-gray-700 text-gray-200 p-4 rounded-lg shadow card-enter">
            <h2 className="text-lg font-bold mb-4 text-center">تعيين كلمة مرور سحب جديدة</h2>
            <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                    <label className="block font-bold mb-2">كلمة المرور الجديدة (6 أرقام)</label>
                    <div className="relative">
                        <input
                            type={passwordVisibility['reset_new'] ? 'text' : 'password'}
                            placeholder="أدخل 6 أرقام"
                            value={newWithdrawalPassword}
                            onChange={(e) => setNewWithdrawalPassword(e.target.value)}
                            maxLength={6}
                            className="w-full p-3 rounded-lg border-gray-600 bg-gray-600 text-white border focus:ring-indigo-500 focus:border-indigo-500 text-center tracking-[.5em] pl-12"
                        />
                         <button type="button" onClick={() => toggleVisibility('reset_new')} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {passwordVisibility['reset_new'] ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block font-bold mb-2">تأكيد كلمة المرور الجديدة</label>
                    <div className="relative">
                        <input
                           type={passwordVisibility['reset_confirm'] ? 'text' : 'password'}
                            placeholder="أعد إدخال 6 أرقام"
                            value={confirmNewWithdrawalPassword}
                            onChange={(e) => setConfirmNewWithdrawalPassword(e.target.value)}
                            maxLength={6}
                            className="w-full p-3 rounded-lg border-gray-600 bg-gray-600 text-white border focus:ring-indigo-500 focus:border-indigo-500 text-center tracking-[.5em] pl-12"
                        />
                         <button type="button" onClick={() => toggleVisibility('reset_confirm')} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {passwordVisibility['reset_confirm'] ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                <button type="submit" disabled={isResetting} className="w-full bg-indigo-500 text-white font-bold p-3 rounded-lg shadow-lg flex items-center justify-center disabled:bg-indigo-300">
                    {isResetting ? <Spinner /> : 'حفظ كلمة المرور الجديدة'}
                </button>
                 <button type="button" onClick={() => setRecoveryStep('idle')} className="w-full bg-gray-600 text-gray-200 font-bold p-3 rounded-lg">
                    إلغاء
                </button>
            </form>
        </div>
    );

    const renderContent = () => {
        if (recoveryStep === 'verify') return renderVerifyStep();
        if (recoveryStep === 'reset') return renderResetStep();

        if (walletLinkedSuccess) return renderWalletLinkedSuccessStep();

        // Default 'idle' state
        if (!currentUser.withdrawalWallet) return renderLinkWalletStep();
        if (!currentUser.withdrawalPassword) return renderSetPasswordStep();
        return renderWithdrawStep();
    };


    return (
        <SubPageLayout title="ينسحب">
            <div className="p-4 space-y-6 text-right">
                {renderContent()}
            </div>
        </SubPageLayout>
    );
};

export default WithdrawPage;