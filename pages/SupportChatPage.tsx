import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import SubPageLayout from '../components/SubPageLayout';
import { SendIcon, PaperclipIcon, UserCircleIcon, Trash2Icon } from '../components/icons';
import Spinner from '../components/Spinner';
import { showToast } from '../utils/toast';

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result as string;
            resolve(base64data.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const LanguageSelection: React.FC<{ onSelect: (lang: 'ar' | 'en') => void }> = ({ onSelect }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Select Language</h2>
            <p className="text-gray-400 mb-8">Please choose your preferred language for support.</p>
            <div className="space-y-4 w-full max-w-xs">
                <button onClick={() => onSelect('en')} className="w-full p-4 bg-indigo-500 text-white font-bold rounded-lg text-lg">English</button>
                <button onClick={() => onSelect('ar')} className="w-full p-4 bg-indigo-500 text-white font-bold rounded-lg text-lg">العربية</button>
            </div>
        </div>
    );
};

const SupportChatPage: React.FC = () => {
    const { session, loadSession, sendMessage, isSending } = useChat();
    const { currentUser } = useAuth();
    const [input, setInput] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session?.messages]);

    const handleLanguageSelect = (lang: 'ar' | 'en') => {
        loadSession(lang);
    };

    const handleSend = async () => {
        if (!input.trim() && !image) return;
        const textToSend = input;
        const imageToSend = image;
        setInput('');
        setImage(null);
        setImagePreview(null);
        await sendMessage(textToSend, imageToSend || undefined);
    };
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                showToast('Image size should be less than 4MB.');
                return;
            }
            const base64 = await blobToBase64(file);
            setImage(base64);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    if (!session) {
        return (
            <SubPageLayout title="AI Live Support">
                <div className="h-[calc(100vh-3.5rem)] bg-gray-900">
                    <LanguageSelection onSelect={handleLanguageSelect} />
                </div>
            </SubPageLayout>
        );
    }

    return (
        <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-900">
            <header className="bg-gray-800 text-white h-14 flex items-center justify-center px-4 sticky top-0 z-20 shadow-md">
                 <h1 className="font-bold text-lg">AI Live Support</h1>
            </header>
            <div ref={messagesEndRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {session.messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-white font-bold text-sm">AI</span></div>}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                            {msg.image && <img src={`data:image/jpeg;base64,${msg.image}`} alt="User upload" className="rounded-lg mb-2 max-h-48" />}
                            <p className="text-sm" style={{ direction: session.language === 'ar' ? 'rtl' : 'ltr' }}>{msg.text}</p>
                            <p className="text-xs text-gray-400 mt-1 text-left">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        {msg.role === 'user' && <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0"><UserCircleIcon className="w-6 h-6 text-gray-400" /></div>}
                    </div>
                ))}
                {isSending && (
                     <div className="flex items-end gap-2 justify-start">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-white font-bold text-sm">AI</span></div>
                        <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                            <Spinner size="sm" color="light" />
                        </div>
                    </div>
                )}
            </div>
            <div className="p-2 border-t border-gray-700 bg-gray-800">
                {imagePreview && (
                    <div className="relative w-24 h-24 p-1">
                        <img src={imagePreview} alt="Preview" className="rounded-lg w-full h-full object-cover" />
                        <button onClick={() => { setImage(null); setImagePreview(null); }} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">
                            <Trash2Icon className="w-3 h-3"/>
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-indigo-400">
                        <PaperclipIcon className="w-6 h-6" />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 p-3 bg-gray-700 text-gray-200 rounded-full outline-none"
                    />
                    <button onClick={handleSend} disabled={isSending} className="p-3 bg-indigo-600 text-white rounded-full disabled:bg-indigo-400">
                        <SendIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupportChatPage;