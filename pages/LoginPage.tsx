import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../utils/toast';
import Spinner from '../components/Spinner';
import { RefrigeratorIcon, EyeIcon, EyeOffIcon } from '../components/icons';

const LoginPage: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAwaiting2FA, setIsAwaiting2FA] = useState(false);
    const [totpCode, setTotpCode] = useState('');
    const navigate = useNavigate();
    const { login, verifyTwoFactorLogin } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!/^\d{10}$/.test(phone)) {
            showToast('الرجاء إدخال رقم هاتف صحيح مكون من 10 أرقام');
            return;
        }

        setIsLoading(true);
        try {
            await login(phone, password);
            navigate('/');
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === '2FA_REQUIRED') {
                    setIsAwaiting2FA(true);
                } else {
                    showToast(error.message);
                }
            } else {
                showToast('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await verifyTwoFactorLogin(totpCode);
            navigate('/');
        } catch (error) {
            if (error instanceof Error) {
                showToast(error.message);
            } else {
                showToast('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    const renderLoginForm = () => (
         <form onSubmit={handleLogin} className="mt-8 space-y-6 text-right auth-card-enter" style={{ animationDelay: '150ms' }}>
            <div className="relative">
                <input
                    type="tel"
                    placeholder="رقم الهاتف (10 أرقام)"
                    value={phone}
                    maxLength={10}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full auth-input p-3 rounded-lg pr-12 text-right transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60">+20</span>
            </div>
            <div className="relative">
                <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    placeholder="كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full auth-input p-3 rounded-lg text-right transition-all pl-12"
                />
                 <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                    aria-label={isPasswordVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                    {isPasswordVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
            </div>
            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-white/90 hover:bg-white text-indigo-700 font-bold p-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out active:scale-95 flex items-center justify-center disabled:bg-white/50 disabled:cursor-not-allowed"
            >
                {isLoading ? <Spinner color="dark" /> : 'تسجيل الدخول'}
            </button>
        </form>
    );

    const render2FAForm = () => (
         <form onSubmit={handleVerify2FA} className="mt-8 space-y-6 text-right auth-card-enter" style={{ animationDelay: '150ms' }}>
            <div>
                <label className="block text-white/80 text-sm mb-2">أدخل رمز التحقق المكون من 6 أرقام من تطبيق المصادقة الخاص بك.</label>
                <input
                    type="tel"
                    placeholder="- - - - - -"
                    value={totpCode}
                    maxLength={6}
                    onChange={(e) => setTotpCode(e.target.value)}
                    className="w-full auth-input p-3 rounded-lg text-center tracking-[0.5em] font-mono transition-all"
                />
            </div>
            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-white/90 hover:bg-white text-indigo-700 font-bold p-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out active:scale-95 flex items-center justify-center disabled:bg-white/50 disabled:cursor-not-allowed"
            >
                {isLoading ? <Spinner color="dark" /> : 'تحقق'}
            </button>
        </form>
    );

    return (
        <div className="min-h-screen animated-gradient-bg flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-sm text-center text-white">
                <div className="auth-card-enter">
                    <RefrigeratorIcon className="w-20 h-20 mx-auto mb-4 text-white/80" />
                    <h1 className="text-4xl font-bold tracking-wider">Refrigerators</h1>
                    <p className="opacity-80 mt-2">
                        {isAwaiting2FA ? 'التحقق بخطوتين' : 'أهلاً بعودتك! الرجاء تسجيل الدخول.'}
                    </p>
                </div>

                {isAwaiting2FA ? render2FAForm() : renderLoginForm()}

                {!isAwaiting2FA && (
                     <div className="text-center mt-6 auth-card-enter" style={{ animationDelay: '300ms' }}>
                        <Link to="/register" className="text-sm text-white/80 hover:text-white font-semibold">
                            ليس لديك حساب؟ سجل الآن &gt;
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPage;