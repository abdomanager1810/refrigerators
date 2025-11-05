import { ChatSession } from '../types';

const CHAT_DB_KEY = 'refrigerators_chat_db_v1';

const getChatDb = (): Record<string, ChatSession> => {
    try {
        const dbString = localStorage.getItem(CHAT_DB_KEY);
        return dbString ? JSON.parse(dbString) : {};
    } catch (error) {
        console.error("Failed to read chat DB from localStorage", error);
        return {};
    }
};

const saveChatDb = (db: Record<string, ChatSession>) => {
    try {
        localStorage.setItem(CHAT_DB_KEY, JSON.stringify(db));
    } catch (error) {
        console.error("Failed to save chat DB to localStorage", error);
    }
};

export const getSessionForUser = (userId: string): ChatSession | undefined => {
    const db = getChatDb();
    return db[userId];
};

export const createOrUpdateSession = (session: ChatSession): void => {
    const db = getChatDb();
    db[session.id] = session;
    saveChatDb(db);
};

export const getAllSessions = (): ChatSession[] => {
    const db = getChatDb();
    return Object.values(db).sort((a, b) => b.lastUpdated - a.lastUpdated);
};

export const deleteSession = (userId: string): void => {
    const db = getChatDb();
    delete db[userId];
    saveChatDb(db);
};