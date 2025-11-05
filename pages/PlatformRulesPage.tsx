import React from 'react';
import SubPageLayout from '../components/SubPageLayout';
import { useSiteConfig } from '../hooks/useSiteConfig';

const rulesData = [
    { name: 'Smart hosting 01', price: 200, daily: 60, total: 3600, days: 60 },
    { name: 'Smart hosting 02', price: 600, daily: 140, total: 8400, days: 60 },
    { name: 'Smart hosting 03', price: 1000, daily: 350, total: 21000, days: 60 },
    { name: 'Smart hosting 04', price: 1500, daily: 430, total: 25800, days: 60 },
    { name: 'Smart hosting 05', price: 2000, daily: 600, total: 36000, days: 60 },
    { name: 'Smart hosting 06', price: 10000, daily: 3200, total: 192000, days: 60 },
    { name: 'Smart hosting 07', price: 25000, daily: 8250, total: 495000, days: 60 },
    { name: 'Smart hosting 08', price: 50000, daily: 16500, total: 990000, days: 60 },
    { name: 'Smart hosting 09', price: 100000, daily: 35000, total: 2100000, days: 60 },
];

const PlatformRulesPage: React.FC = () => {
    const { config } = useSiteConfig();
    
    return (
        <SubPageLayout title="قواعد المنصة">
            <div className="bg-gray-800 p-4 text-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-center text-sm">
                        <thead className="bg-indigo-500/20 text-gray-100">
                            <tr>
                                <th className="p-2">تتولى</th>
                                <th className="p-2">السعر</th>
                                <th className="p-2">الدخل اليومي</th>
                                <th className="p-2">الدخل الإجمالي</th>
                                <th className="p-2">أيام الصلاحية</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rulesData.map((item, index) => (
                                <tr key={item.name} className={index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-700/50'}>
                                    <td className="p-2 whitespace-nowrap">{item.name}</td>
                                    <td className="p-2">EGP {item.price}</td>
                                    <td className="p-2">EGP {item.daily}</td>
                                    <td className="p-2">EGP {item.total}</td>
                                    <td className="p-2">{item.days}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                 <div className="mt-6 text-right text-sm text-gray-300 space-y-4 leading-relaxed whitespace-pre-line">
                    {config.platformRulesContent}
                </div>
            </div>
        </SubPageLayout>
    );
};

export default PlatformRulesPage;