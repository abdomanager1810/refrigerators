import React from 'react';
import SubPageLayout from '../components/SubPageLayout';
import { ChevronLeftIcon, SendIcon } from '../components/icons';

const CustomerServicePage: React.FC = () => {

    const serviceLinks = [
        { name: 'Telegram', link: 'https://t.me/Refrigerator_support' },
        { name: 'قناة التلجرام', link: 'https://t.me/ho2yJOgwggrxYWVi' },
        { name: 'مجموعة تيليجرام', link: 'https://t.me/ho2yJOgwggrxYWVi' },
    ];

    return (
        <SubPageLayout title="خدمة العملاء">
            <div className="bg-gray-100 pb-4">
                <header className="relative h-56 bg-blue-400">
                    <img src="https://i.imgur.com/vHqJ8Yt.jpg" alt="Customer Service" className="absolute inset-0 w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10 flex flex-col items-center justify-end h-full text-white p-4">
                        <div className="bg-black/40 backdrop-blur-sm py-2 px-6 rounded-lg">
                            <h2 className="text-sm text-center">وقت خدمة العملاء عبر الإنترنت</h2>
                            <p className="text-xl font-bold text-center">9:00-19:00</p>
                        </div>
                    </div>
                </header>

                <main className="p-4 space-y-3 -mt-4 relative z-20">
                    {serviceLinks.map((item, index) => (
                        <a 
                            key={index}
                            href={item.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white p-4 rounded-lg shadow flex justify-between items-center w-full"
                        >
                             <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center ml-3">
                                     <SendIcon className="w-5 h-5 text-blue-500" />
                                </div>
                                <span className="font-semibold text-gray-700">{item.name}</span>
                            </div>
                            <ChevronLeftIcon className="w-5 h-5 text-gray-400 transform scale-x-[-1]" />
                        </a>
                    ))}

                    <div className="bg-white p-4 rounded-lg shadow text-right text-gray-600 text-sm leading-relaxed space-y-3">
                        <p>إذا كان لديك أي استفسارات بشأن منصتنا، يرجى الاتصال بممثل خدمة العملاء عبر الإنترنت، الذي سيقوم بالرد على جميع استفساراتك.</p>
                        <p>إذا لم يرد ممثل خدمة العملاء عبر الإنترنت على رسائلك على الفور، نرجو منك التفضل بالصبر. قد يكون ذلك بسبب كثرة الرسائل. سيقوم ممثل خدمة العملاء عبر الإنترنت بالرد على رسائلك في أقرب وقت ممكن. شكرًا لتفهمك ودعمك.</p>
                        <p>إذا كنت ترغب في كسب المزيد من المال، تأكد من الانضمام إلى قناتنا الرسمية على Telegram!</p>
                    </div>
                </main>
            </div>
        </SubPageLayout>
    );
};
export default CustomerServicePage;