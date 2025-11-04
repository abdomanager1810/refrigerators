import React from 'react';
import SubPageLayout from '../components/SubPageLayout';

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
    return (
        <SubPageLayout title="قواعد المنصة">
            <div className="bg-white p-4 text-gray-800">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-center text-sm">
                        <thead className="bg-indigo-50">
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
                                <tr key={item.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
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

                 <div className="mt-6 text-right text-sm text-gray-700 space-y-4 leading-relaxed">
                    <p>هي شركة رائدة في مجال التداول الخوارزمي للعملات الأجنبية والعملات المشفرة باستخدام الذكاء الاصطناعي. نحن نستخدم الذكاء الاصطناعي المتقدم لتحسين استراتيجيات التداول، وتعزيز كفاءة السوق، ومساعدة العملاء في تحقيق عوائد استثمارية فائقة، مما يتيح للعملاء العالميين الاستفادة من الخدمات المالية الذكية.</p>
                    <p>عندما يقوم صديق قمت بدعوته بالتسجيل والاستثمار، ستحصل على الفور على مكافأة نقدية تعادل 35% من مبلغ استثماره.</p>
                    <p>عندما يستثمر أعضاء فريقك من المستوى 2، ستحصل على مكافأة نقدية بنسبة 2%.</p>
                    <p>عندما يستثمر أعضاء فريقك من المستوى 3، ستحصل على مكافأة نقدية بنسبة 1%.</p>
                    <p>بمجرد أن يستثمر أعضاء فريقك، ستضاف المكافآت النقدية على الفور إلى رصيد حسابك وستكون متاحة للسحب فورا.</p>
                    <p>1. استثمر 200 جنيه مصري، واسحب 100 جنيه مصري.</p>
                    <p>2. مكافأة التسجيل: 100 جنيه مصري. يمكن سحبها بعد الإيداع.</p>
                    <p>3. مكافأة تسجيل الدخول اليومية: 5 جنيهات مصرية.</p>
                    <p>4. قم بإحالة شركاء للاستثمار واحصل على مكافأة نقدية بنسبة 38% من مبلغ استثماراتهم.</p>
                    <p>5. يمكن أن تصل عوائد الاستثمار إلى 2100% - انضم الآن.</p>
                </div>
            </div>
        </SubPageLayout>
    );
};

export default PlatformRulesPage;