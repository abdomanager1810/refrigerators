import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SubPageLayout from '../components/SubPageLayout';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../utils/toast';
import { ClipboardIcon } from '../components/icons';
import { getConfig } from '../data/configDb';
import Spinner from '../components/Spinner';

const EWalletInputModal: React.FC<{ onConfirm: (wallet: string) => void; }> = ({ onConfirm }) => {
    const [wallet, setWallet] = useState(Array(11).fill(''));
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { value } = e.target;
        if (/^[0-9]$/.test(value) || value === '') {
            const newWallet = [...wallet];
            newWallet[index] = value;
            setWallet(newWallet);
            if (value && index < 10) {
                inputsRef.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !wallet[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handleSubmit = () => {
        const walletNumber = wallet.join('');
        if (walletNumber.length !== 11) {
            showToast('الرجاء إدخال رقم المحفظة الصحيح المكون من 11 رقمًا');
            return;
        }
        onConfirm(walletNumber);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 text-gray-200 rounded-lg w-full max-w-md text-center p-6 shadow-lg">
                <h3 className="font-bold text-lg mb-2">يرجى ملء رقم المحفظة الإلكترونية الصحيح لتأكيد الدفع.</h3>
                <p className="text-gray-300 mb-6 text-sm">إذا طلبت من شخص آخر الدفع نيابة عنك، فيرجى التأكد من صحة رقم المحفظة الإلكترونية للدفع.</p>
                <div className="flex justify-center gap-1 mb-6" dir="ltr">
                    {wallet.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputsRef.current[index] = el}
                            type="tel"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="w-8 h-10 text-center border-b-2 border-gray-500 bg-gray-800 text-white focus:border-indigo-500 outline-none text-lg"
                        />
                    ))}
                </div>
                <button onClick={handleSubmit} className="w-full px-6 py-2 bg-indigo-500 text-white rounded-md">
                    تأكيد ثم إرسال
                </button>
            </div>
        </div>
    );
};

const ReminderModal: React.FC<{ amount: number; onClose: () => void; }> = ({ amount, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 text-gray-200 rounded-lg w-full max-w-sm text-center p-6 shadow-lg">
            <h3 className="font-bold text-lg mb-4">تذكير هام</h3>
            <p className="text-gray-300 mb-2">تذكر، المبلغ الذي تحتاج إلى دفعه هو:</p>
            <p className="text-3xl font-bold text-indigo-400 mb-2">{amount.toLocaleString()} EGP</p>
            <p className="text-sm text-red-400 mb-6">سيؤدي مبلغ الدفع غير الصحيح إلى عدم الوصول السريع.</p>
            <button onClick={onClose} className="w-full px-6 py-2 bg-gray-600 text-gray-200 rounded-md">موافق</button>
        </div>
    </div>
);

const PaymentPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { requestRecharge } = useAuth();
    const [amount, setAmount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
    const [step, setStep] = useState<'enterWallet' | 'showDetails'>('enterWallet');
    const [userWallet, setUserWallet] = useState('');
    const [modal, setModal] = useState<'ewallet' | 'reminder' | null>('ewallet');
    const [receiverWallet, setReceiverWallet] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        const config = getConfig();
        setReceiverWallet(config.paymentInfo.receiverWallet);
        if (location.state?.amount) {
            setAmount(location.state.amount);
        } else {
            navigate('/recharge');
        }
    }, [location.state, navigate]);

    useEffect(() => {
        if (timeLeft === 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            showToast('تم النسخ!');
        });
    };

    const handleWalletConfirm = (wallet: string) => {
        setUserWallet(wallet);
        setModal(null);
        setTimeout(() => setModal('reminder'), 100);
    };
    
    const handleReminderClose = () => {
        setModal(null);
        setStep('showDetails');
    };
    
    const handleSubmitPayment = async () => {
        setIsLoading(true);
        try {
            await requestRecharge(amount, userWallet);
            showToast(`تم تقديم طلب الشحن الخاص بك بمبلغ ${amount.toFixed(2)} جنيه وهو قيد المراجعة الآن.`);
            navigate('/records');
        } catch(error) {
            if (error instanceof Error) showToast(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!amount) return null;

    return (
        <SubPageLayout title="E-Wallet">
            {modal === 'ewallet' && <EWalletInputModal onConfirm={handleWalletConfirm} />}
            {modal === 'reminder' && <ReminderModal amount={amount} onClose={handleReminderClose} />}
            
            <div className="p-4 space-y-4 text-center text-gray-300">
                <p>يجب عليك إكمال الدفع في غضون المهلة الزمنية التالية:</p>
                <p className="text-4xl font-bold text-indigo-400 my-4">{formatTime(timeLeft)}</p>

                {step === 'showDetails' && (
                    <>
                        <div className="bg-orange-900/50 border border-orange-500/50 text-orange-300 p-3 rounded-lg text-right">
                             <p className="font-bold mb-2">يرجى التحقق من المحفظة الإلكترونية الصحيحة للدفع:</p>
                             <div className="flex justify-between items-center">
                                <span className="font-mono text-lg">{userWallet}</span>
                                <button onClick={() => setModal('ewallet')} className="text-sm text-indigo-400">تعديل</button>
                             </div>
                        </div>

                        <div className="bg-red-900/50 border border-red-500/50 text-red-300 p-3 rounded-lg text-right flex items-start gap-3">
                            <span className="text-2xl mt-1">💡</span>
                            <p>يرجى فتح تطبيق المحفظة الإلكترونية الخاص بك ودفع المبلغ المقابل للمحفظة المستلمة أدناه.</p>
                        </div>
                        
                        <div className="bg-gray-700 p-4 rounded-lg shadow text-right">
                            <p className="text-sm text-gray-400">يرجى الدفع إلى حساب المحفظة الإلكترونية:</p>
                             <div className="flex justify-between items-center mt-1">
                                <span className="font-mono text-xl font-bold text-gray-100">{receiverWallet}</span>
                                <button onClick={() => copyToClipboard(receiverWallet)} className="flex items-center gap-1 text-indigo-400">
                                    <ClipboardIcon className="w-4 h-4" />
                                    <span>نسخ</span>
                                </button>
                             </div>
                        </div>

                        <div className="bg-gray-700 p-4 rounded-lg shadow text-right">
                            <p className="text-sm text-gray-400">مبلغ الدفع:</p>
                             <div className="flex justify-between items-center mt-1">
                                <span className="font-mono text-xl font-bold text-gray-100">{amount.toLocaleString()} EGP</span>
                                <button onClick={() => copyToClipboard(amount.toString())} className="flex items-center gap-1 text-indigo-400">
                                    <ClipboardIcon className="w-4 h-4" />
                                    <span>نسخ</span>
                                </button>
                             </div>
                        </div>

                        <p className="text-sm text-gray-400 mt-6">إذا تم إكمال الدفع، يرجى النقر على الزر أدناه. سيقوم المسؤول بمراجعة طلبك.</p>
                        <button onClick={handleSubmitPayment} disabled={isLoading} className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg shadow-lg mt-2 flex justify-center items-center">
                           {isLoading ? <Spinner /> : 'لقد أكملت الدفع'}
                        </button>
                    </>
                )}
            </div>
        </SubPageLayout>
    );
};

export default PaymentPage;