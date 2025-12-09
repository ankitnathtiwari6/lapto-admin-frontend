import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import OrdersPage from "./pages/OrdersPage";
import NewOrderPage from "./pages/NewOrderPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import EditOrderPage from "./pages/EditOrderPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentsPage from "./pages/PaymentsPage";
import SalesListPage from "./pages/SalesListPage";
import PurchasesListPage from "./pages/PurchasesListPage";
import CustomersPage from "./pages/CustomersPage";
import NewCustomerPage from "./pages/NewCustomerPage";
import EngineersPage from "./pages/EngineersPage";
import StaffPage from "./pages/StaffPage";
import StaffFormPage from "./pages/StaffFormPage";
import UserFormPage from "./pages/UserFormPage";
import SettingsLayout from "./pages/settings/SettingsLayout";
import ServiceTypesSettings from "./pages/settings/ServiceTypesSettings";
import DeviceTypesSettings from "./pages/settings/DeviceTypesSettings";
import TaskTypesSettings from "./pages/settings/TaskTypesSettings";
import OutcomeTypesSettings from "./pages/settings/OutcomeTypesSettings";
import StagesSettings from "./pages/settings/StagesSettings";
import UsersSettings from "./pages/settings/UsersSettings";
import CompanySettings from "./pages/settings/CompanySettings";
import EngineerTasksPage from "./pages/EngineerTasksPage";
import EngineerTaskDetailPage from "./pages/EngineerTaskDetailPage";
import LaptoAdminLoginPage from "./pages/lapto-admin/LaptoAdminLoginPage";
import LaptoAdminLayout from "./pages/lapto-admin/LaptoAdminLayout";
import CompanyListPage from "./pages/lapto-admin/CompanyListPage";
import CreateCompanyPage from "./pages/lapto-admin/CreateCompanyPage";
import CompanyStaffPage from "./pages/lapto-admin/CompanyStaffPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function LaptoAdminRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  if (!token) {
    return <Navigate to="/lapto-admin/login" />;
  }

  if (userType !== "lapto_admin") {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function RoleBasedHome() {
  const { user } = useAuth();

  if (user?.role === 'engineer') {
    return <Navigate to="/engineer/tasks" replace />;
  }

  return <DashboardPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Lapto Admin Routes */}
      <Route path="/lapto-admin/login" element={<LaptoAdminLoginPage />} />
      <Route
        path="/lapto-admin"
        element={
          <LaptoAdminRoute>
            <LaptoAdminLayout />
          </LaptoAdminRoute>
        }
      >
        <Route index element={<Navigate to="/lapto-admin/companies" replace />} />
        <Route path="companies" element={<CompanyListPage />} />
        <Route path="companies/new" element={<CreateCompanyPage />} />
        <Route path="companies/:companyId/staff" element={<CompanyStaffPage />} />
      </Route>

      {/* Regular App Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<RoleBasedHome />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/new" element={<NewOrderPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="orders/:id/edit" element={<EditOrderPage />} />
        <Route path="orders/:orderId/invoices" element={<PaymentPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="sales" element={<SalesListPage />} />
        <Route path="purchases" element={<PurchasesListPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/new" element={<NewCustomerPage />} />
        <Route path="customers/:id/edit" element={<UserFormPage />} />
        <Route path="engineers" element={<EngineersPage />} />
        <Route path="engineers/new" element={<UserFormPage />} />
        <Route path="engineers/:id/edit" element={<UserFormPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="staff/new" element={<StaffFormPage />} />
        <Route path="staff/:id/edit" element={<StaffFormPage />} />
        <Route path="users/new" element={<UserFormPage />} />
        <Route path="users/:id/edit" element={<UserFormPage />} />
        <Route path="engineer/tasks" element={<EngineerTasksPage />} />
        <Route path="engineer/tasks/:id" element={<EngineerTaskDetailPage />} />
        <Route path="settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="/settings/services" replace />} />
          <Route path="services" element={<ServiceTypesSettings />} />
          <Route path="devices" element={<DeviceTypesSettings />} />
          <Route path="task-types" element={<TaskTypesSettings />} />
          <Route path="outcome-types" element={<OutcomeTypesSettings />} />
          <Route path="stages" element={<StagesSettings />} />
          <Route path="users" element={<UsersSettings />} />
          <Route path="company" element={<CompanySettings />} />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
