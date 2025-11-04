import React, { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import { User, Transaction, Product, PurchasedProduct, Notification, WithdrawalWallet } from '../types';
import { useProducts } from './useProducts';
import * as db from '../data/db';
import { getConfig } from '../data/configDb';

interface AuthContextType {
    currentUser: User | null;
    login: (phone: string, password: string) => Promise<User>;
    register: (phone: string, password: string, referrerCode: string) => Promise<User>;
    logout: () => void;
    addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
    requestRecharge: (amount: number) => Promise<void>;
    purchaseProduct: (productId: number) => Promise<void>;
    sellProduct: (purchasedProductId: string) => Promise<void>;
    withdraw: (amount: number, withdrawalPassword: string) => Promise<void>;
    linkWithdrawalWallet: (wallet: WithdrawalWallet) => Promise<void>;
    setWithdrawalPassword: (password: string) => Promise<void>;
    resetWithdrawalPassword: (password: string) => Promise<void>;
    changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
    updateEmail: (email: string) => Promise<void>;
    markNotificationsAsRead: () => void;
    dailyCheckIn: () => Promise<string>;
    hasCheckedInToday: () => boolean;
    // 2FA Methods
    generateTwoFactorSecret: () => Promise<string>;
    confirmTwoFactorAuth: (totpCode: string) => Promise<void>;
    disableTwoFactorAuth: (totpCode: string) => Promise<void>;
    verifyTwoFactorLogin: (totpCode: string) => Promise<User>;
}

const LOW_BALANCE_THRESHOLD = 50.00;

const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const generateTransactionId = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const randomPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `T${year}${month}${day}${hours}${minutes}${seconds}${randomPart}`;
};

const _addNotification = (user: User, title: string, message: string): User => {
    const newNotification: Notification = {
        id: crypto.randomUUID(),
        title,
        message,
        timestamp: Date.now(),
        read: false,
    };
    return {
        ...user,
        notifications: [newNotification, ...(user.notifications || [])],
    };
};

const _handleLowBalanceNotification = (userBefore: User, userAfter: User): User => {
    if (userBefore.balance >= LOW_BALANCE_THRESHOLD && userAfter.balance < LOW_BALANCE_THRESHOLD) {
        return _addNotification(
            userAfter,
            'انخفاض الرصيد',
            `رصيد حسابك منخفض (${userAfter.balance.toFixed(2)} جنيه). يرجى إعادة الشحن لمواصلة الاستثمار.`
        );
    }
    return userAfter;
};

const _hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const _simpleHash = async (text: string): Promise<string> => {
    const buffer = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
    const view = new DataView(buffer);
    const num = view.getUint32(buffer.byteLength - 4);
    return (num % 1000000).toString().padStart(6, '0');
};

const _verifyTotp = async (secret: string, code: string): Promise<boolean> => {
    const currentMinute = Math.floor(Date.now() / 60000); // More stable than getUTCMinutes()
    const expectedCode = await _simpleHash(secret + currentMinute.toString());
    
    // Also check the code from the previous minute for a 30-60 second validity window
    const prevMinute = currentMinute - 1;
    const prevExpectedCode = await _simpleHash(secret + prevMinute.toString());

    return code === expectedCode || code === prevExpectedCode;
};


export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userAwaiting2FA, setUserAwaiting2FA] = useState<User | null>(null);
    const { getProductById, updateProduct } = useProducts();

    const updateUser = (updatedUser: User) => {
        setCurrentUser(updatedUser);
        db.saveUser(updatedUser);
    }

    const calculateAndApplyIncome = (user: User, fromTimestamp: number, toTimestamp: number): User => {
        const hoursPassed = (toTimestamp - fromTimestamp) / (1000 * 60 * 60);
        if (hoursPassed <= 0 || user.purchasedProducts.length === 0) {
            return { ...user, lastLogin: toTimestamp };
        }

        let newTransactions: Transaction[] = [];
        let totalEarnedIncome = 0;

        user.purchasedProducts.forEach(p => {
            const productDetails = getProductById(p.productId);
            if (productDetails) {
                const productAgeDays = (toTimestamp - p.purchaseDate) / (1000 * 60 * 60 * 24);
                if (productAgeDays <= productDetails.validity) {
                    const hourlyIncome = productDetails.dailyIncome / 24;
                    const earnedFromThisProduct = hourlyIncome * hoursPassed;
                    
                    if (earnedFromThisProduct >= 0.01) {
                        const incomeTransaction: Transaction = {
                            id: generateTransactionId(),
                            type: 'income',
                            description: `دخل من ${productDetails.title}`,
                            amount: earnedFromThisProduct,
                            timestamp: toTimestamp,
                            purchasedProductId: p.id,
                        };
                        newTransactions.push(incomeTransaction);
                        totalEarnedIncome += earnedFromThisProduct;
                    }
                }
            }
        });

        if (newTransactions.length > 0) {
            return {
                ...user,
                balance: user.balance + totalEarnedIncome,
                totalRevenue: user.totalRevenue + totalEarnedIncome,
                transactions: [...newTransactions, ...user.transactions],
                lastLogin: toTimestamp,
            };
        }
        
        // Even if no income was earned, update lastLogin to prevent large calculations next time.
        return { ...user, lastLogin: toTimestamp };
    };

    useEffect(() => {
        if (!currentUser) {
            return;
        }

        const intervalId = setInterval(() => {
            const latestUser = db.findUserByPhone(currentUser.phone);

            if (!latestUser) {
                clearInterval(intervalId);
                return;
            }

            const now = Date.now();
            const lastLogin = latestUser.lastLogin || now;
            
            if (now - lastLogin < 10000) return; // Don't run too frequently

            const updatedUser = calculateAndApplyIncome(latestUser, lastLogin, now);

            if (updatedUser !== latestUser) {
                 updateUser(updatedUser);
            }
           
        }, 10000); // Run every 10 seconds

        return () => clearInterval(intervalId);
    }, [currentUser]);

    const login = (phone: string, password: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            const user = db.findUserByPhone(phone);
            if (user && user.password === password) {
                if (user.isTwoFactorEnabled) {
                    setUserAwaiting2FA(user);
                    reject(new Error('2FA_REQUIRED'));
                } else {
                    const now = Date.now();
                    const lastLogin = user.lastLogin || now;
                    const userAfterIncome = calculateAndApplyIncome(user, lastLogin, now);
                    updateUser(userAfterIncome);
                    sessionStorage.setItem('loggedInUser', userAfterIncome.phone);
                    resolve(userAfterIncome);
                }
            } else {
                if (!user) {
                    return reject(new Error('رقم الهاتف هذا غير مسجل.'));
                }
                // if user exists, then password must be wrong
                return reject(new Error('كلمة المرور التي أدخلتها غير صحيحة.'));
            }
        });
    };

    const verifyTwoFactorLogin = (totpCode: string): Promise<User> => {
        return new Promise(async (resolve, reject) => {
            if (!userAwaiting2FA || !userAwaiting2FA.twoFactorSecret) {
                return reject(new Error('No user awaiting 2FA.'));
            }

            const isValid = await _verifyTotp(userAwaiting2FA.twoFactorSecret, totpCode);
            if (isValid) {
                const now = Date.now();
                const lastLogin = userAwaiting2FA.lastLogin || now;
                const userAfterIncome = calculateAndApplyIncome(userAwaiting2FA, lastLogin, now);
                
                updateUser(userAfterIncome);
                sessionStorage.setItem('loggedInUser', userAfterIncome.phone);
                setUserAwaiting2FA(null);
                resolve(userAfterIncome);
            } else {
                reject(new Error('رمز التحقق غير صحيح.'));
            }
        });
    };

    const register = (phone: string, password: string, referrerCode: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            if (db.findUserByPhone(phone)) {
                return reject(new Error('رقم الهاتف مسجل بالفعل.'));
            }

            let referrerUser: User | undefined = undefined;
            const normalizedReferrerCode = referrerCode.trim().toUpperCase();

            // Only validate the referrer code if one was provided
            if (normalizedReferrerCode) {
                referrerUser = db.findUserByInviteCode(normalizedReferrerCode);
                if (!referrerUser) {
                    return reject(new Error('كود الدعوة الذي أدخلته غير صالح.'));
                }
            }
            
            let newUser: User = {
                phone,
                password,
                inviteCode: generateInviteCode(),
                balance: 100.00, // Welcome bonus
                totalRevenue: 0.00,
                transactions: [
                    {
                        id: generateTransactionId(),
                        type: 'reward',
                        description: 'مكافأة التسجيل',
                        amount: 100.00,
                        timestamp: Date.now()
                    }
                ],
                purchasedProducts: [],
                notifications: [],
                lastLogin: Date.now(),
                lastCheckIn: 0,
                referrer: referrerUser?.phone, // Optional referrer
                team: { lv1: [], lv2: [], lv3: [] },
                teamBonuses: { lv1: 0, lv2: 0, lv3: 0 },
                isTwoFactorEnabled: false,
            };
            
            newUser = _addNotification(newUser, 'مكافأة التسجيل', 'مرحباً بك! لقد حصلت على 100.00 جنيه مكافأة تسجيل.');

            const usersToUpdate: User[] = [newUser];

            // --- Update referrer chain if a referrer exists ---
            if (referrerUser) {
                // LV1
                referrerUser.team.lv1.push(newUser.phone);
                usersToUpdate.push(referrerUser);

                // LV2
                if (referrerUser.referrer) {
                    const lv2Referrer = db.findUserByPhone(referrerUser.referrer);
                    if (lv2Referrer) {
                        lv2Referrer.team.lv2.push(newUser.phone);
                        usersToUpdate.push(lv2Referrer);
                        
                        // LV3
                        if (lv2Referrer.referrer) {
                            const lv3Referrer = db.findUserByPhone(lv2Referrer.referrer);
                            if (lv3Referrer) {
                                lv3Referrer.team.lv3.push(newUser.phone);
                                usersToUpdate.push(lv3Referrer);
                            }
                        }
                    }
                }
            }
            // --- End of update ---
            
            db.saveMultipleUsers(usersToUpdate);
            setCurrentUser(newUser);
            sessionStorage.setItem('loggedInUser', newUser.phone);
            resolve(newUser);
        });
    };

    const logout = () => {
        setCurrentUser(null);
        setUserAwaiting2FA(null);
        sessionStorage.removeItem('loggedInUser');
    };

    const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
        if (!currentUser) return;
        
        const newTransaction: Transaction = {
            ...transaction,
            id: generateTransactionId(),
            timestamp: Date.now()
        };

        let updatedUser: User = {
            ...currentUser,
            balance: currentUser.balance + transaction.amount,
            transactions: [newTransaction, ...currentUser.transactions],
        };

        if (transaction.type === 'recharge') {
            updatedUser = _addNotification(updatedUser, 'إعادة الشحن ناجحة', `تم شحن حسابك بمبلغ ${transaction.amount.toFixed(2)} جنيه.`);
        }

        updateUser(updatedUser);
    };

    const requestRecharge = (amount: number): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!currentUser) return reject(new Error('User not logged in'));
    
            const rechargeTransaction: Transaction = {
                id: generateTransactionId(),
                type: 'recharge',
                description: `طلب شحن`,
                amount: amount,
                timestamp: Date.now(),
                status: 'pending',
            };
    
            let updatedUser: User = {
                ...currentUser,
                transactions: [rechargeTransaction, ...currentUser.transactions],
            };
    
            updatedUser = _addNotification(
                updatedUser, 
                'طلب شحن قيد المراجعة', 
                `تم تقديم طلب الشحن الخاص بك بمبلغ ${amount.toFixed(2)} جنيه وهو قيد المراجعة الآن.`
            );
    
            updateUser(updatedUser);
            resolve();
        });
    };

    const purchaseProduct = (productId: number): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            if (!currentUser) return reject(new Error('User not logged in'));
            
            const product = getProductById(productId);
            if (!product) return reject(new Error('Product not found'));

            const ownedCount = currentUser.purchasedProducts.filter(p => p.productId === productId).length;
            if (product.purchaseLimit && ownedCount >= product.purchaseLimit) {
                return reject(new Error('لقد وصلت إلى الحد الأقصى للشراء لهذا المنتج'));
            }

            if (currentUser.balance < product.price) {
                return reject(new Error('رصيد غير كاف'));
            }

            if (product.soldCount >= product.totalQuantity) {
                 return reject(new Error("المنتج مباع"));
            }

            try {
                // This will check and update the global inventory
                await updateProduct({ ...product, soldCount: product.soldCount + 1 });
            } catch(error) {
                return reject(error as Error);
            }

            // If global check passes, proceed with user-specific transaction
            const purchaseTransaction: Transaction = {
                id: generateTransactionId(),
                type: 'purchase',
                description: `شراء ${product.title}`,
                amount: -product.price,
                timestamp: Date.now()
            };

            const newPurchasedProduct: PurchasedProduct = {
                id: crypto.randomUUID(),
                productId: product.id,
                purchaseDate: Date.now()
            };

            let updatedUser: User = {
                ...currentUser,
                balance: currentUser.balance - product.price,
                transactions: [purchaseTransaction, ...currentUser.transactions],
                purchasedProducts: [...currentUser.purchasedProducts, newPurchasedProduct]
            };

            updatedUser = _addNotification(updatedUser, 'شراء ناجح', `لقد قمت بشراء ${product.title} بنجاح.`);
            
            updatedUser = _handleLowBalanceNotification(currentUser, updatedUser);

            updateUser(updatedUser);
            
            // --- Award referral bonuses ---
            const usersToUpdate: User[] = [];
            let currentReferrerPhone = updatedUser.referrer;
            
            const applyBonus = (level: 1 | 2 | 3, referrerPhone: string, purchasePrice: number): string | undefined => {
                const referrer = db.findUserByPhone(referrerPhone);
                if (!referrer) return undefined;

                const rates = { 1: 0.35, 2: 0.02, 3: 0.01 };
                const bonus = purchasePrice * rates[level];

                const mutableReferrer = { ...referrer, transactions: [...referrer.transactions] };
                mutableReferrer.balance += bonus;
                if (level === 1) mutableReferrer.teamBonuses.lv1 += bonus;
                if (level === 2) mutableReferrer.teamBonuses.lv2 += bonus;
                if (level === 3) mutableReferrer.teamBonuses.lv3 += bonus;

                const bonusTransaction: Transaction = {
                    id: generateTransactionId(),
                    type: 'reward',
                    description: `مكافأة فريق المستوى ${level} من المستخدم ****${currentUser.phone.slice(-4)}`,
                    amount: bonus,
                    timestamp: Date.now()
                };
                mutableReferrer.transactions.unshift(bonusTransaction);
                
                const updatedReferrerWithNotification = _addNotification(
                    mutableReferrer, 
                    `مكافأة فريق المستوى ${level}`, 
                    `لقد حصلت على ${bonus.toFixed(2)} جنيه مكافأة من استثمار عضو في فريقك.`
                );

                usersToUpdate.push(updatedReferrerWithNotification);
                return updatedReferrerWithNotification.referrer; // Return next referrer's phone
            };

            // LV1 Bonus
            if (currentReferrerPhone) {
                currentReferrerPhone = applyBonus(1, currentReferrerPhone, product.price);

                // LV2 Bonus
                if (currentReferrerPhone) {
                    currentReferrerPhone = applyBonus(2, currentReferrerPhone, product.price);

                    // LV3 Bonus
                    if (currentReferrerPhone) {
                        applyBonus(3, currentReferrerPhone, product.price);
                    }
                }
            }

            if (usersToUpdate.length > 0) {
                db.saveMultipleUsers(usersToUpdate);
            }
            // --- End of bonus awards ---

            resolve();
        });
    };

    const sellProduct = (purchasedProductId: string): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            if (!currentUser) return reject(new Error('User not logged in'));

            const productToSell = currentUser.purchasedProducts.find(p => p.id === purchasedProductId);
            if (!productToSell) return reject(new Error('Product instance not found'));
            
            const productDetails = getProductById(productToSell.productId);
            if (!productDetails) return reject(new Error('Product details not found'));

            // This is a user action, so it should decrement the global count
            if (productDetails.soldCount > 0) {
                 await updateProduct({ ...productDetails, soldCount: productDetails.soldCount - 1 });
            }

            const sellPrice = productDetails.price * 0.10; // Sell price is 10% of original

            const sellTransaction: Transaction = {
                id: generateTransactionId(),
                type: 'sell',
                description: `بيع ${productDetails.title}`,
                amount: sellPrice, // Selling gives money back at the reduced price
                timestamp: Date.now()
            };

            let updatedUser: User = {
                ...currentUser,
                balance: currentUser.balance + sellPrice,
                transactions: [sellTransaction, ...currentUser.transactions],
                purchasedProducts: currentUser.purchasedProducts.filter(p => p.id !== purchasedProductId)
            };
            
            updatedUser = _addNotification(updatedUser, 'بيع ناجح', `لقد قمت ببيع ${productDetails.title} بنجاح مقابل ${sellPrice.toFixed(2)} جنيه.`);

            updateUser(updatedUser);
            resolve();
        });
    }

    const withdraw = (amount: number, withdrawalPassword: string): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            if (!currentUser) return reject(new Error('User not logged in'));

            const config = getConfig();
            const { is24Hour, startHour, endHour } = config.withdrawalSettings;

            if (!is24Hour) {
                const now = new Date();
                const EGYPT_TIME_OFFSET = 2; // EET is UTC+2
                const egyptHour = (now.getUTCHours() + EGYPT_TIME_OFFSET) % 24;

                if (egyptHour < startHour || egyptHour >= endHour) {
                    return reject(new Error(`يمكن إجراء عمليات السحب فقط بين الساعة ${startHour}:00 و ${endHour}:00 بتوقيت مصر.`));
                }
            }
            
            if (!currentUser.withdrawalWallet) {
                return reject(new Error('الرجاء ربط محفظة سحب أولاً.'));
            }
            if (!currentUser.withdrawalPassword) {
                return reject(new Error('الرجاء تعيين كلمة مرور السحب أولاً.'));
            }
            
            const inputHash = await _hashPassword(withdrawalPassword);
            if (currentUser.withdrawalPassword !== inputHash) {
                return reject(new Error('كلمة مرور السحب غير صحيحة.'));
            }

            const MIN_WITHDRAWAL = 100;
            const MAX_WITHDRAWAL = 60000;

            if (amount < MIN_WITHDRAWAL) {
                return reject(new Error(`الحد الأدنى للسحب هو ${MIN_WITHDRAWAL} جنيه`));
            }
            if (amount > MAX_WITHDRAWAL) {
                return reject(new Error(`الحد الأقصى للسحب هو ${MAX_WITHDRAWAL} جنيه`));
            }
            if (amount > currentUser.balance) {
                return reject(new Error('رصيد غير كاف'));
            }
            
            const FEE_PERCENTAGE = 0.15;
            const fee = amount * FEE_PERCENTAGE;

            const withdrawTransaction: Transaction = {
                id: generateTransactionId(),
                type: 'withdraw',
                description: `سحب (رسوم ${fee.toFixed(2)} جنيه)`,
                amount: -amount,
                timestamp: Date.now(),
                status: 'pending',
            };
            
            let updatedUser: User = {
                ...currentUser,
                balance: currentUser.balance - amount,
                transactions: [withdrawTransaction, ...currentUser.transactions],
            };

            updatedUser = _addNotification(updatedUser, 'طلب سحب', `تم تقديم طلب السحب الخاص بك بمبلغ ${amount.toFixed(2)} جنيه.`);
            
            updatedUser = _handleLowBalanceNotification(currentUser, updatedUser);

            updateUser(updatedUser);
            resolve();
        });
    };

    const linkWithdrawalWallet = (wallet: WithdrawalWallet): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!currentUser) return reject(new Error('User not logged in'));
            if (currentUser.withdrawalWallet) return reject(new Error('يمكن ربط محفظة سحب واحدة فقط.'));
            
            let updatedUser: User = {
                ...currentUser,
                withdrawalWallet: wallet
            };
            
            updatedUser = _addNotification(
                updatedUser,
                'تم ربط المحفظة بنجاح',
                `تم ربط محفظتك (${wallet.walletType}) بنجاح وهي جاهزة للاستخدام.`
            );

            updateUser(updatedUser);
            resolve();
        });
    };

    const setWithdrawalPassword = (password: string): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            if (!currentUser) return reject(new Error('User not logged in'));
            if (currentUser.withdrawalPassword) return reject(new Error('تم تعيين كلمة مرور السحب بالفعل.'));
            
            const hashedPassword = await _hashPassword(password);
            
            const updatedUser: User = {
                ...currentUser,
                withdrawalPassword: hashedPassword,
            };

            updateUser(updatedUser);
            resolve();
        });
    };

    const resetWithdrawalPassword = (password: string): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            if (!currentUser) return reject(new Error('User not logged in'));
            
            const hashedPassword = await _hashPassword(password);

            const updatedUser: User = {
                ...currentUser,
                withdrawalPassword: hashedPassword,
            };

            updateUser(updatedUser);
            resolve();
        });
    };

     const changePassword = (oldPassword: string, newPassword: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!currentUser) return reject(new Error("User not logged in."));

            if (currentUser.password !== oldPassword) {
                return reject(new Error("كلمة المرور الحالية غير صحيحة."));
            }

            const updatedUser = { ...currentUser, password: newPassword };
            updateUser(updatedUser);
            resolve();
        });
    };
    
    const updateEmail = (email: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!currentUser) return reject(new Error("User not logged in."));
            
            // Basic email validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return reject(new Error("يرجى إدخال عنوان بريد إلكتروني صالح."));
            }

            const updatedUser: User = { ...currentUser, email };
            updateUser(updatedUser);
            resolve();
        });
    };


    const markNotificationsAsRead = () => {
        if (!currentUser || !currentUser.notifications) return;
        
        const hasUnread = currentUser.notifications.some(n => !n.read);
        if (!hasUnread) return;

        const updatedNotifications = currentUser.notifications.map(n => ({ ...n, read: true }));
        const updatedUser = { ...currentUser, notifications: updatedNotifications };
        updateUser(updatedUser);
    };

    const dailyCheckIn = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!currentUser) return reject(new Error('User not logged in'));
    
            const now = new Date();
            const lastCheck = new Date(currentUser.lastCheckIn || 0);
    
            if (now.toDateString() === lastCheck.toDateString()) {
                return reject(new Error('لقد قمت بتسجيل الوصول بالفعل اليوم.'));
            }
    
            const CHECK_IN_REWARD = 5.00;
    
            const rewardTransaction: Transaction = {
                id: generateTransactionId(),
                type: 'reward',
                description: 'مكافأة تسجيل الوصول اليومي',
                amount: CHECK_IN_REWARD,
                timestamp: now.getTime()
            };
    
            let updatedUser: User = {
                ...currentUser,
                balance: currentUser.balance + CHECK_IN_REWARD,
                transactions: [rewardTransaction, ...currentUser.transactions],
                lastCheckIn: now.getTime(),
            };
    
            updatedUser = _addNotification(updatedUser, 'مكافأة يومية', `لقد حصلت على ${CHECK_IN_REWARD.toFixed(2)} جنيه مكافأة تسجيل الوصول اليومية.`);
            
            updateUser(updatedUser);
            resolve(`تهانينا! لقد حصلت على ${CHECK_IN_REWARD.toFixed(2)} جنيه.`);
        });
    };

    const hasCheckedInToday = (): boolean => {
        if (!currentUser) return false;
        const now = new Date();
        const lastCheck = new Date(currentUser.lastCheckIn || 0);
        return now.toDateString() === lastCheck.toDateString();
    };

    // --- 2FA Methods ---
    const generateTwoFactorSecret = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!currentUser) return reject(new Error('User not logged in.'));
            const secret = Math.random().toString(36).substring(2, 12).toUpperCase();
            const updatedUser = { ...currentUser, twoFactorSecret: secret };
            updateUser(updatedUser);
            resolve(secret);
        });
    };

    const confirmTwoFactorAuth = (totpCode: string): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            if (!currentUser || !currentUser.twoFactorSecret) {
                return reject(new Error('No secret key found for user.'));
            }

            const isValid = await _verifyTotp(currentUser.twoFactorSecret, totpCode);
            if (isValid) {
                const updatedUser = { ...currentUser, isTwoFactorEnabled: true };
                updateUser(updatedUser);
                resolve();
            } else {
                reject(new Error('رمز التحقق غير صحيح.'));
            }
        });
    };

    const disableTwoFactorAuth = (totpCode: string): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            if (!currentUser || !currentUser.twoFactorSecret) {
                return reject(new Error('2FA is not enabled.'));
            }
            const isValid = await _verifyTotp(currentUser.twoFactorSecret, totpCode);
            if (isValid) {
                const updatedUser = { ...currentUser, isTwoFactorEnabled: false, twoFactorSecret: undefined };
                updateUser(updatedUser);
                resolve();
            } else {
                reject(new Error('رمز التحقق غير صحيح.'));
            }
        });
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, register, logout, addTransaction, purchaseProduct, sellProduct, withdraw, linkWithdrawalWallet, setWithdrawalPassword, resetWithdrawalPassword, changePassword, updateEmail, markNotificationsAsRead, dailyCheckIn, hasCheckedInToday, generateTwoFactorSecret, confirmTwoFactorAuth, disableTwoFactorAuth, verifyTwoFactorLogin, requestRecharge }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};