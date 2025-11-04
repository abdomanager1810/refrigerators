
import React, { useEffect } from 'react';
import SubPageLayout from '../components/SubPageLayout';
import { useAuth } from '../hooks/useAuth';
import { Notification } from '../types';
import { BellIcon } from '../components/icons';

const EmptyState: React.FC = () => (
    <div className="text-center py-20">
        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <BellIcon className="w-16 h-16 text-gray-400" />
        </div>
        <p className="text-gray-500">لا توجد إشعارات بعد</p>
    </div>
);

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    const date = new Date(notification.timestamp);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    return (
        <div className="bg-white p-4 text-right border-b border-gray-200">
            <div className="flex justify-between items-center mb-1">
                <p className="font-bold text-gray-800">{notification.title}</p>
                <p className="text-xs text-gray-400">{formattedDate}</p>
            </div>
            <p className="text-sm text-gray-600">{notification.message}</p>
        </div>
    );
};


const NotificationsPage: React.FC = () => {
    const { currentUser, markNotificationsAsRead } = useAuth();
    
    useEffect(() => {
        markNotificationsAsRead();
    }, [markNotificationsAsRead]);

    const notifications = currentUser?.notifications || [];

    return (
        <SubPageLayout title="الإشعارات">
            {notifications.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-px">
                    {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
                </div>
            )}
        </SubPageLayout>
    );
};

export default NotificationsPage;