
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import TeamPage from './pages/TeamPage';
import AccountPage from './pages/AccountPage';
import Layout from './components/Layout';
import RechargePage from './pages/RechargePage';
import RecordsPage from './pages/RecordsPage';
import PlatformRulesPage from './pages/PlatformRulesPage';
import WithdrawPage from './pages/WithdrawPage';
import NotificationsPage from './pages/NotificationsPage';
import PaymentPage from './pages/PaymentPage';
import CustomerServicePage from './pages/CustomerServicePage';
import AboutUsPage from './pages/AboutUsPage';
import MyProductsPage from './pages/MyProductsPage';
import { ProductsProvider } from './hooks/useProducts';
import SubordinatesDataPage from './pages/SubordinatesDataPage';
import ProductDetailPage from './pages/ProductDetailPage';
// FIX: Changed import to default import as AdminPage is a default export.
import AdminPage from './pages/AdminPage';
import { SiteConfigProvider } from './hooks/useSiteConfig';
import { LanguageProvider } from './hooks/useLanguage';
import { ChatProvider } from './hooks/useChat';
import SupportChatPage from './pages/SupportChatPage';

const ProtectedRoutes: React.FC = () => {
    const { currentUser } = useAuth();
    return currentUser ? <Layout><Outlet /></Layout> : <Navigate to="/login" />;
};

const AppContent: React.FC = () => {
    return (
        <div className="bg-gray-900 min-h-screen font-sans">
            <HashRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route element={<ProtectedRoutes />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/:productId" element={<ProductDetailPage />} />
                        <Route path="/team" element={<TeamPage />} />
                        <Route path="/account" element={<AccountPage />} />
                        <Route path="/recharge" element={<RechargePage />} />
                        <Route path="/payment" element={<PaymentPage />} />
                        <Route path="/records" element={<RecordsPage />} />
                        <Route path="/platform-rules" element={<PlatformRulesPage />} />
                        <Route path="/withdraw" element={<WithdrawPage />} />
                        <Route path="/notifications" element={<NotificationsPage />} />
                        <Route path="/customer-service" element={<CustomerServicePage />} />
                        <Route path="/about-us" element={<AboutUsPage />} />
                        <Route path="/my-products" element={<MyProductsPage />} />
                        <Route path="/subordinates-data" element={<SubordinatesDataPage />} />
                        <Route path="/support-chat" element={<SupportChatPage />} />
                    </Route>
                     <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </HashRouter>
        </div>
    );
}

const App: React.FC = () => {
    return (
        <LanguageProvider>
            <SiteConfigProvider>
                <ProductsProvider>
                    <AuthProvider>
                        <ChatProvider>
                            <AppContent />
                        </ChatProvider>
                    </AuthProvider>
                </ProductsProvider>
            </SiteConfigProvider>
        </LanguageProvider>
    );
};

export default App;