import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { Toaster } from 'sonner';

// Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { OtpVerification } from './pages/auth/OtpVerification';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { PaymentManagement } from './pages/admin/PaymentManagement';
import { TransactionManagement } from './pages/admin/TransactionManagement';
import { FraudDetectionCenter } from './pages/admin/FraudDetectionCenter';
import { WebhookMonitoring } from './pages/admin/WebhookMonitoring';
import { KafkaEventMonitor } from './pages/admin/KafkaEventMonitor';
import { IdempotencyManagement } from './pages/admin/IdempotencyManagement';
import { AuditLogs } from './pages/admin/AuditLogs';
import { AiInsights } from './pages/admin/AiInsights';
import { SystemSettings } from './pages/admin/SystemSettings';
import { UserDashboard } from './pages/user/UserDashboard';
import { MakePayment } from './pages/user/MakePayment';
import { TransactionHistory } from './pages/user/TransactionHistory';
import { PaymentDetails } from './pages/user/PaymentDetails';
import { AiAssistant } from './pages/user/AiAssistant';
import { ProfilePage } from './pages/user/ProfilePage';
import { NotificationsPage } from './pages/user/NotificationsPage';
import { HelpSupport } from './pages/user/HelpSupport';

import { PaymentSuccess } from './pages/user/PaymentSuccess';
import { PaymentFailed } from './pages/user/PaymentFailed';
import { PaymentPending } from './pages/user/PaymentPending';

import { Error403 } from './pages/common/Error403';
import { Error404 } from './pages/common/Error404';
import { Error500 } from './pages/common/Error500';

// Simple placeholder components for other sidebar menu links
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-left dark:border-slate-800 dark:bg-slate-900 transition-colors">
    <h1 className="text-2xl font-bold tracking-tight">{title} Console</h1>
    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
      This workstation section is a placeholder for Phase 1. The functionality is scheduled for implementation in Phase 2/3.
    </p>
  </div>
);

// Root redirect handler
const RootRedirect: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'Admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/user/dashboard" replace />;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Root Route */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth Routes wrapped with AuthLayout */}
      <Route
        path="/login"
        element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        }
      />
      <Route
        path="/register"
        element={
          <AuthLayout>
            <Register />
          </AuthLayout>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AuthLayout>
            <ForgotPassword />
          </AuthLayout>
        }
      />
      <Route
        path="/reset-password"
        element={
          <AuthLayout>
            <ResetPassword />
          </AuthLayout>
        }
      />
      <Route
        path="/verify-otp"
        element={
          <AuthLayout>
            <OtpVerification />
          </AuthLayout>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="payments" element={<PaymentManagement />} />
                <Route path="transactions" element={<TransactionManagement />} />
                <Route path="fraud" element={<FraudDetectionCenter />} />
                <Route path="webhooks" element={<WebhookMonitoring />} />
                <Route path="kafka" element={<KafkaEventMonitor />} />
                <Route path="idempotency" element={<IdempotencyManagement />} />
                <Route path="audit-logs" element={<AuditLogs />} />
                <Route path="ai-insights" element={<AiInsights />} />
                <Route path="settings" element={<SystemSettings />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Merchant User Protected Routes */}
      <Route
        path="/user/*"
        element={
          <ProtectedRoute allowedRoles={['User']}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="payments" element={<MakePayment />} />
                <Route path="payments/:id" element={<PaymentDetails />} />
                <Route path="activity" element={<TransactionHistory />} />
                <Route path="ai" element={<AiAssistant />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="support" element={<HelpSupport />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Standalone checkout outcome screens */}
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failed" element={<PaymentFailed />} />
      <Route path="/payment/pending" element={<PaymentPending />} />

      {/* Common Status Pages */}
      <Route path="/403" element={<Error403 />} />
      <Route path="/500" element={<Error500 />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
            <Toaster position="top-right" richColors theme="system" />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
