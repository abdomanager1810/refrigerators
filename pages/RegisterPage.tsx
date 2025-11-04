import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../utils/toast';
import Spinner from '../components/Spinner';
import { RefrigeratorIcon, EyeIcon, EyeOffIcon } from '../components/icons';

const RegisterPage: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [isRefLocked, setIsRefLocked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const refCode = params.get('ref');
        if (refCode) {
            setInviteCode(refCode.trim().toUpperCase());
            setIsRefLocked(true);
        }
    }, [location.search]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!/^\d{10}$/.test(phone)) {
            showToast('الرجاء إدخال رقم هاتف صحيح مكون من 10 أرقام');
            return;
        }
        if (password.length < 6) {
            showToast('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
            return;
        }
        if (password !== confirmPassword) {
            showToast('كلمات المرور غير متطابقة');
            return;
        }

        setIsLoading(true);
        try {
            await register(phone, password, inviteCode);
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
    };
    
    return (
         <div className="min-h-screen animated-gradient-bg flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-sm text-center text-white">
                 <div className="auth-card-enter">
                    <RefrigeratorIcon className="w-16 h-16 mx-auto mb-3 text-white/80" />
                    <h1 className="text-3xl font-bold tracking-wider">إنشاء حساب</h1>
                    <p className="opacity-80 mt-1">انضم إلينا وابدأ الاستثمار.</p>
                </div>

                <form onSubmit={handleRegister} className="mt-6 space-y-4 text-right auth-card-enter" style={{ animationDelay: '150ms' }}>
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
                            placeholder="كلمة المرور (6+ أحرف)"
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
                     <div className="relative">
                        <input
                           type={isConfirmPasswordVisible ? 'text' : 'password'}
                            placeholder="تأكيد كلمة المرور"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full auth-input p-3 rounded-lg text-right transition-all pl-12"
                        />
                         <button
                            type="button"
                            onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                            aria-label={isConfirmPasswordVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                        >
                            {isConfirmPasswordVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="كود الدعوة (اختياري)"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            readOnly={isRefLocked}
                            className={`w-full auth-input p-3 rounded-lg text-center tracking-widest transition-all ${isRefLocked ? 'bg-white/5 cursor-not-allowed' : ''}`}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-white/90 hover:bg-white text-indigo-700 font-bold p-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out active:scale-95 flex items-center justify-center disabled:bg-white/50 disabled:cursor-not-allowed !mt-6"
                    >
                        {isLoading ? <Spinner color="dark" /> : 'تسجيل حساب'}
                    </button>
                </form>
                 <div className="text-center mt-6 auth-card-enter" style={{ animationDelay: '300ms' }}>
                    <Link to="/login" className="text-sm text-white/80 hover:text-white font-semibold">
                        لديك حساب بالفعل؟ تسجيل الدخول &lt;
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;