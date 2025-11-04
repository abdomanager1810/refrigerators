
import React, { useState } from 'react';
import SubPageLayout from '../components/SubPageLayout';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../utils/toast';
import { useNavigate } from 'react-router-dom';


const RechargePage: React.FC = () => {
    const { currentUser } = useAuth();
    const [amount, setAmount] = useState('');
    const navigate = useNavigate();

    const handleRecharge = () => {
        const rechargeAmount = parseFloat(amount);
        if (isNaN(rechargeAmount) || rechargeAmount < 200 || rechargeAmount > 60000) {
            showToast('الرجاء إدخال مبلغ صحيح بين 200 و 60000 جنيه');
            return;
        }
        navigate('/payment', { state: { amount: rechargeAmount } });
    }
    
    const rechargeOptions = [200, 600, 1000, 2500, 5000, 10000];

    return (
        <SubPageLayout title="إعادة الشحن">
            <div className="bg-gray-100">
                 <header className="bg-gradient-to-b from-indigo-400 to-indigo-600 h-32 p-4 text-white text-right relative">
                    <p className="text-sm">رصيد الحساب</p>
                    <p className="text-3xl font-bold">EGP {currentUser?.balance.toFixed(2)}</p>
                     <div className="absolute top-4 left-4 h-20 w-20 opacity-20">
                        <img src="https://i.imgur.com/k6k2n5w.png" alt="coin" className="w-full h-full opacity-50"/>
                    </div>
                </header>

                <main className="p-4 space-y-6">
                    <div className="text-right">
                        <h3 className="font-bold">اختر مبلغ الشحن</h3>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                        {rechargeOptions.map((option) => (
                            <button
                                key={option}
                                onClick={() => setAmount(option.toString())}
                                className={`p-3 rounded-lg shadow text-center text-lg font-bold transition-colors ${
                                    amount === option.toString()
                                    ? 'bg-indigo-500 text-white ring-2 ring-indigo-300'
                                    : 'bg-white text-gray-700'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-right mb-2">أو أدخل مبلغًا مخصصًا</h3>
                        <div className="relative">
                             <input 
                                type="number"
                                placeholder="أدخل المبلغ (200 - 60000)"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full p-4 rounded-lg border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 text-right pr-12"
                            />
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">EGP</span>
                        </div>
                       
                    </div>

                     <button onClick={handleRecharge} className="w-full bg-indigo-500 text-white font-bold p-3 rounded-lg shadow-lg">
                        اشحن الآن
                    </button>

                    <div className="text-right text-sm text-gray-600 space-y-2">
                        <h3 className="font-bold text-base text-gray-800">تعليمات إعادة الشحن</h3>
                        <p>1. يرجى إدخال مبلغ إعادة الشحن الصحيح والنقر على زر "اشحن الآن".</p>
                        <p>2. سيتم توجيهك إلى صفحة الدفع، يرجى إتمام الدفع في الوقت المحدد.</p>
                        <p>3. حدود الشحن: الحد الأدنى 200 جنيه مصري، الحد الأقصى 60000 جنيه مصري.</p>
                    </div>
                </main>
            </div>
        </SubPageLayout>
    );
};

export default RechargePage;