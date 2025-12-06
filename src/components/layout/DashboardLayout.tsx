import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Wrench,
  Bell,
  MessageSquare,
  ChevronDown,
} from "lucide-react";

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Define navigation based on user role
  const getNavigationForRole = () => {
    if (user?.role === 'engineer') {
      // Engineer only sees their tasks
      return [
        { name: "My Tasks", href: "/engineer/tasks", icon: Package },
      ];
    }

    // Admin, Super Admin, and other roles see full navigation
    return [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Orders", href: "/orders", icon: Package },
      // { name: "Payments", href: "/payments", icon: Receipt },
      // { name: "Sales", href: "/sales", icon: TrendingUp },
      // { name: "Purchases", href: "/purchases", icon: ShoppingCart },
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Staffs", href: "/staff", icon: Wrench },
      { name: "Settings", href: "/settings", icon: Settings },
    ];
  };

  const navigation = getNavigationForRole();

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">
            Lapto <span className="text-purple-600">Admin</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`nav-item ${active ? "active" : ""}`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-purple-600 font-semibold text-sm">
              {user?.fullName?.charAt(0) || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.fullName || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate capitalize">
              {user?.role || "Admin"}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>

        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
          <SidebarContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search bar */}
            <div className="hidden md:flex flex-1 max-w-md ml-4 lg:ml-0">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="What do you want to find?"
                  className="w-full h-10 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right side icons */}
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg">
                <MessageSquare className="w-5 h-5" />
              </button>

              {/* User dropdown (desktop) */}
              <div className="hidden lg:flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-sm">
                    {user?.fullName?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role || "Admin"}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
