import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import { ChatSession, ChatMessage } from '../types';
import * as chatDb from '../data/chatDb';
import { useAuth } from './useAuth';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Part } from '@google/genai';
import { showToast } from '../utils/toast';

interface ChatContextType {
    session: ChatSession | null;
    loadSession: (language: 'ar' | 'en') => void;
    sendMessage: (text: string, image?: string) => Promise<void>;
    isSending: boolean;
    getAllSessions: () => ChatSession[];
    updateSession: (session: ChatSession) => void;
    deleteSession: (userId: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [session, setSession] = useState<ChatSession | null>(null);
    const [isSending, setIsSending] = useState(false);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const loadSession = (language: 'ar' | 'en') => {
        if (!currentUser) return;
        let userSession = chatDb.getSessionForUser(currentUser.phone);
        if (!userSession) {
            userSession = {
                id: currentUser.phone,
                language,
                messages: [],
                isClosed: false,
                lastUpdated: Date.now(),
            };
            chatDb.createOrUpdateSession(userSession);
        }
        // If language has changed, we might want to reset or handle it.
        // For now, just update the session language if it's different.
        if (userSession.language !== language) {
            userSession.language = language;
            chatDb.createOrUpdateSession(userSession);
        }
        setSession(userSession);
    };

    const sendMessage = async (text: string, image?: string) => {
        if (!session || !currentUser) return;
        setIsSending(true);

        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            text,
            image,
            timestamp: Date.now(),
        };

        const updatedMessages = [...session.messages, userMessage];
        const updatedSession = { ...session, messages: updatedMessages, lastUpdated: Date.now() };
        setSession(updatedSession);
        chatDb.createOrUpdateSession(updatedSession);
        
        try {
            const systemInstruction = `You are a helpful customer support agent for an investment platform called 'Refrigerators'. Your name is Alex. Please respond ONLY in ${session.language === 'ar' ? 'Arabic' : 'English'}. The user's phone number is ${currentUser.phone} and their invite code is ${currentUser.inviteCode}.`;

            const contents = updatedMessages.map(msg => {
                const parts: Part[] = [{ text: msg.text }];
                if (msg.image) {
                    parts.unshift({
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: msg.image,
                        },
                    });
                }
                return { role: msg.role, parts };
            });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents,
                config: { systemInstruction, safetySettings }
            });

            const modelMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'model',
                text: response.text,
                timestamp: Date.now(),
            };
            
            const finalSession = { ...updatedSession, messages: [...updatedMessages, modelMessage], lastUpdated: Date.now() };
            setSession(finalSession);
            chatDb.createOrUpdateSession(finalSession);

        } catch (error) {
            console.error("Gemini API error:", error);
            showToast('Sorry, there was an error communicating with the AI.');
            const errorMessage: ChatMessage = {
                 id: crypto.randomUUID(),
                role: 'model',
                text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
                timestamp: Date.now(),
            }
            const finalSession = { ...updatedSession, messages: [...updatedMessages, errorMessage], lastUpdated: Date.now() };
            setSession(finalSession);
            chatDb.createOrUpdateSession(finalSession);

        } finally {
            setIsSending(false);
        }
    };

    const getAllSessions = () => {
        return chatDb.getAllSessions();
    };

    const updateSession = (sessionToUpdate: ChatSession) => {
        chatDb.createOrUpdateSession(sessionToUpdate);
        if (sessionToUpdate.id === session?.id) {
            setSession(sessionToUpdate);
        }
    };
    
    const deleteSession = (userId: string) => {
        chatDb.deleteSession(userId);
        if(userId === session?.id) {
            setSession(null);
        }
    }


    return (
        <ChatContext.Provider value={{ session, loadSession, sendMessage, isSending, getAllSessions, updateSession, deleteSession }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};