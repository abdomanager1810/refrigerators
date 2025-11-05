import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../utils/toast';
import { useNavigate } from 'react-router-dom';
import { MessageCircleIcon, ChevronRightIcon, CalendarIcon, DollarSignIcon, BookOpenIcon, CopyIcon, PercentIcon } from '../components/icons';

const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
        showToast(message);
    });
};

const TeamStatCard: React.FC<{ title: string; stats: { label: string; value: string | number }[] }> = ({ title, stats }) => (
    <div className="bg-gray-700 p-4 rounded-lg shadow-md flex-1">
        <h3 className="font-bold text-center text-gray-100 mb-3">{title}</h3>
        <div className="space-y-3 text-center">
            {stats.map(stat => (
                <div key={stat.label}>
                    <p className="text-lg font-bold text-indigo-400">{stat.value}</p>
                    <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
            ))}
        </div>
    </div>
);

const NavLinkItem: React.FC<{ icon: React.FC<any>, label: string, path: string }> = ({ icon: Icon, label, path }) => {
    const navigate = useNavigate();
    return (
        <button onClick={() => path !== '#' && navigate(path)} className="flex items-center justify-between w-full p-4 bg-gray-700 rounded-lg shadow-md disabled:opacity-50" disabled={path === '#'}>
            <div className="flex items-center">
                <Icon className="w-6 h-6 text-indigo-400 mr-4" />
                <span className="font-semibold text-gray-200">{label}</span>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-500" />
        </button>
    );
};


const TeamPage: React.FC = () => {
    const { currentUser } = useAuth();

    const inviteCode = currentUser?.inviteCode || '...';
    
    const directSubordinatesStats = [
        { label: 'عدد المسجلين', value: currentUser?.team?.lv1?.length || 0 },
        { label: 'عدد الإيداعات', value: 0 },
        { label: 'مبلغ الإيداع', value: '0.00' },
        { label: 'عدد أول إيداع', value: 0 },
    ];

    const teamSubordinatesStats = [
        { label: 'عدد المسجلين', value: (currentUser?.team?.lv2?.length || 0) + (currentUser?.team?.lv3?.length || 0) },
        { label: 'عدد الإيداعات', value: 0 },
        { label: 'مبلغ الإيداع', value: '0.00' },
        { label: 'عدد أول إيداع', value: 0 },
    ];
    
    const totalBonus = (
        (currentUser?.teamBonuses?.lv1 || 0) + 
        (currentUser?.teamBonuses?.lv2 || 0) + 
        (currentUser?.teamBonuses?.lv3 || 0)
    ).toFixed(2);
    
    const navLinks = [
        { icon: CalendarIcon, label: 'بيانات المرؤوسين', path: '/subordinates-data' },
        { icon: DollarSignIcon, label: 'تفاصيل العمولة', path: '/records' },
        { icon: BookOpenIcon, label: 'قواعد الدعوة', path: '/platform-rules' },
        { icon: MessageCircleIcon, label: 'خدمة عملاء الوكيل', path: '/customer-service' },
    ];

    return (
        <div className="bg-gray-800 min-h-screen">
            <header className="bg-indigo-600 p-4 text-white text-center relative shadow-lg">
                <h1 className="text-xl font-bold">الوكالة</h1>
            </header>

            <main className="p-4 space-y-6">
                <div className="bg-gray-700 p-4 rounded-lg shadow-md text-center card-enter">
                    <p className="text-sm text-gray-300">إجمالي العمولة أمس</p>
                    <p className="text-3xl font-bold text-indigo-400 my-1">0.00</p>
                    <p className="text-xs text-indigo-300">قم بترقية المستوى لزيادة دخل العمولة</p>
                </div>

                <div className="flex gap-4 card-enter" style={{animationDelay: '100ms'}}>
                    <TeamStatCard title="المرؤوسين المباشرين" stats={directSubordinatesStats} />
                    <TeamStatCard title="مرؤوسي الفريق" stats={teamSubordinatesStats} />
                </div>
                
                <div className="card-enter" style={{animationDelay: '200ms'}}>
                    <h2 className="font-bold text-lg text-right mb-2 text-gray-200">كود الدعوة</h2>
                    <div className="bg-gray-700 p-3 rounded-lg shadow-md space-y-3">
                        <div className="flex items-center border border-gray-600 rounded-lg p-2">
                             <button onClick={() => copyToClipboard(inviteCode, 'تم نسخ كود الدعوة!')} className="p-2 bg-indigo-500 text-white rounded-md mr-3 flex-shrink-0">
                                <CopyIcon className="w-5 h-5"/>
                            </button>
                            <span className="flex-grow text-right text-sm text-gray-300">نسخ رمز الدعوة</span>
                            <span className="font-mono tracking-widest text-indigo-400 ml-4">{inviteCode}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 card-enter" style={{animationDelay: '300ms'}}>
                    {navLinks.map(link => (
                        <NavLinkItem key={link.label} {...link} />
                    ))}
                </div>

                <div className="bg-gray-700 p-4 rounded-lg shadow-md text-right card-enter" style={{animationDelay: '400ms'}}>
                    <h3 className="font-bold text-gray-100 mb-4">بيانات الترويج</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-lg font-bold text-indigo-400">{(currentUser?.team?.lv1?.length || 0) + (currentUser?.team?.lv2?.length || 0) + (currentUser?.team?.lv3?.length || 0)}</p>
                            <p className="text-xs text-gray-400">إجمالي الفريق</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-indigo-400">{currentUser?.team?.lv1?.length || 0}</p>
                            <p className="text-xs text-gray-400">المرؤوس المباشر</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-indigo-400">{totalBonus}</p>
                            <p className="text-xs text-gray-400">إجمالي العمولة</p>
                        </div>
                         <div>
                            <p className="text-lg font-bold text-indigo-400">{(currentUser?.teamBonuses?.lv1 || 0).toFixed(2)}</p>
                            <p className="text-xs text-gray-400">عمولة المستوى 1</p>
                        </div>
                         <div>
                            <p className="text-lg font-bold text-indigo-400">{(currentUser?.teamBonuses?.lv2 || 0).toFixed(2)}</p>
                            <p className="text-xs text-gray-400">عمولة المستوى 2</p>
                        </div>
                         <div>
                            <p className="text-lg font-bold text-indigo-400">{(currentUser?.teamBonuses?.lv3 || 0).toFixed(2)}</p>
                            <p className="text-xs text-gray-400">عمولة المستوى 3</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeamPage;