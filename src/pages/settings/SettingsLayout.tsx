import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Wrench, Smartphone, GitBranch, Users, Building2 } from "lucide-react";

const SettingsLayout: React.FC = () => {
  const navItems = [
    { to: "/settings/services", icon: Wrench, label: "Service Types" },
    { to: "/settings/devices", icon: Smartphone, label: "Device Types" },
    { to: "/settings/stages", icon: GitBranch, label: "Stages" },
    { to: "/settings/users", icon: Users, label: "Users" },
    { to: "/settings/company", icon: Building2, label: "Company" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <div className="col-span-12 lg:col-span-3">
          <div className="card p-2">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="col-span-12 lg:col-span-9">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
