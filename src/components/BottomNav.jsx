import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  PlusCircle,
  Clock,
  Users,
  BarChart3,
} from "lucide-react";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: "/", icon: Home, label: "خانه" },
    { path: "/history", icon: Clock, label: "تاریخچه" },
    { path: "/create-invoice", icon: PlusCircle, label: "", special: true },
    { path: "/customers", icon: Users, label: "مشتریان" },
    { path: "/reports", icon: BarChart3, label: "گزارش" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)" }}
    >
      <div className="max-w-2xl mx-auto px-4 pb-3">
        <div
          className="pointer-events-auto flex items-center justify-around h-16 rounded-[28px] shadow-2xl"
          style={{
            background: "rgba(17, 17, 17, 0.85)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 -4px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          }}
        >
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;

            if (tab.special) {
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className="relative -mt-6 flex items-center justify-center w-16 h-16 rounded-full active:scale-90 transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    boxShadow: "0 8px 32px rgba(37, 99, 235, 0.4), 0 0 0 3px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <Icon size={28} className="text-white" strokeWidth={2.5} />
                  <div
                    className="absolute inset-0 rounded-full opacity-30 blur-xl"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
                  />
                </button>
              );
            }

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-300 active:scale-90"
              >
                <div className={`relative p-2 rounded-2xl transition-all duration-300 ${isActive ? "bg-blue-500/15" : ""}`}>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={`transition-all duration-300 ${isActive ? "text-blue-500" : "text-gray-500"}`}
                  />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                  )}
                </div>
                <span className={`text-[9px] font-bold tracking-wide transition-all duration-300 ${isActive ? "text-blue-500" : "text-gray-600"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
