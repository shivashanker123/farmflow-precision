import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Droplets,
  Leaf,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Cpu,
} from 'lucide-react';
import { useFarm } from '@/contexts/FarmContext';

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Command Center' },
  { path: '/water-budget', icon: Droplets, label: 'Water Budget' },
  { path: '/crop-doctor', icon: Leaf, label: 'Crop Doctor' },
  { path: '/farm-logs', icon: FileText, label: 'Farm Logs' },
  { path: '/settings', icon: Settings, label: 'Device Settings' },
];

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { farmData } = useFarm();

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar rounded-xl text-sidebar-foreground shadow-lg btn-active"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        className="fixed lg:static top-0 left-0 h-screen w-[260px] bg-sidebar z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sidebar-primary rounded-xl flex items-center justify-center">
              <Cpu className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sidebar-foreground">FarmFlow</h1>
              <p className="text-xs text-sidebar-foreground/60">Precision Water Budgeting</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && onToggle()}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 rounded-full bg-sidebar-primary-foreground"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/50">
            <div className="w-10 h-10 bg-sidebar-primary rounded-full flex items-center justify-center text-sidebar-primary-foreground font-bold">
              {farmData.farmerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sidebar-foreground truncate">
                {farmData.farmerName}
              </p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">
                {farmData.cropType} • {farmData.fieldSize} acres
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </Link>
        </div>
      </motion.aside>
    </>
  );
};

export default DashboardSidebar;
