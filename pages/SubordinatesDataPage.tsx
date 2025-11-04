import React from 'react';
import SubPageLayout from '../components/SubPageLayout';
import { SearchIcon } from '../components/icons';

const SubordinatesDataPage: React.FC = () => {
    // Static data for demonstration
    const stats = [
        { label: 'مبلغ الإيداع', value: '0.00' },
        { label: 'عدد الإيداعات', value: '0' },
        { label: 'إجمالي الاستثمار', value: '0.00' },
        { label: 'عدد المستثمرين', value: '0' },
        { label: 'مبلغ الإيداع الأول', value: '0.00' },
        { label: 'عدد أول إيداع', value: '0' },
    ];

    return (
        <SubPageLayout title="بيانات المرؤوسين">
            <div className="p-4 space-y-4 bg-gray-100 min-h-screen">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="البحث عن UID المرؤوس"
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg text-right"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <div className="flex gap-2">
                    <input
                        type="date"
                        defaultValue="2025-11-02"
                        className="w-full p-2 border border-gray-300 rounded-lg text-right"
                    />
                    <select className="p-2 border border-gray-300 rounded-lg">
                        <option>الكل</option>
                    </select>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-lg p-4 shadow-lg grid grid-cols-2 gap-4 text-center">
                    {stats.map(stat => (
                        <div key={stat.label}>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs opacity-80">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </SubPageLayout>
    );
};

export default SubordinatesDataPage;
