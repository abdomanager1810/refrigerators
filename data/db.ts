import { User } from '../types';

const USERS_DB_KEY = 'xtx_users_db';

// --- Internal Helpers ---

const saveUsersDb = (db: Record<string, User>) => {
    try {
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    } catch (error) {
        console.error("Failed to save users DB to localStorage", error);
    }
};

const getUsersDb = (): Record<string, User> => {
    try {
        const dbString = localStorage.getItem(USERS_DB_KEY);
        if (dbString) {
            return JSON.parse(dbString);
        }

        // If DB doesn't exist, create an empty one.
        console.log("No users DB found. Initializing an empty DB.");
        const initialDb: Record<string, User> = {};
        saveUsersDb(initialDb);
        return initialDb;

    } catch (error) {
        // If there's an error reading, start fresh.
        console.error("Failed to read users DB from localStorage, starting fresh.", error);
        const initialDb: Record<string, User> = {};
        saveUsersDb(initialDb);
        return initialDb;
    }
};


// --- Public API for the DB module ---

/**
 * Finds a user by their phone number.
 * @param phone The user's phone number.
 * @returns The user object or undefined if not found.
 */
export const findUserByPhone = (phone: string): User | undefined => {
    if (!phone) return undefined;
    const db = getUsersDb();
    return db[phone];
};

/**
 * Finds a user by their invite code.
 * @param inviteCode The invite code to search for.
 * @returns The user object or undefined if not found.
 */
export const findUserByInviteCode = (inviteCode: string): User | undefined => {
    if (!inviteCode) return undefined;
    const db = getUsersDb();
    const normalizedCode = inviteCode.trim().toUpperCase();
    return Object.values(db).find(u => u.inviteCode.toUpperCase() === normalizedCode);
};

/**
 * Saves a single user's data to the database.
 * @param user The user object to save.
 */
export const saveUser = (user: User): void => {
    const db = getUsersDb();
    db[user.phone] = user;
    saveUsersDb(db);
};

/**
 * Saves multiple user objects to the database in a single operation.
 * @param users An array of user objects to save.
 */
export const saveMultipleUsers = (users: User[]): void => {
    const db = getUsersDb();
    users.forEach(user => {
        db[user.phone] = user;
    });
    saveUsersDb(db);
};