import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { LogOut, ListMinus, BarChart } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  
  const getUserColor = () => {
    return user?.color === 'red-500' ? 'bg-red-500' : 'bg-blue-500';
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`w-10 h-10 rounded-full ${getUserColor()} flex items-center justify-center`}>
              <span className="text-white font-bold">{user.name[0]}</span>
            </div>
            <span className="font-medium text-gray-800">{user.name}</span>
          </motion.div>
          
          <nav className="flex items-center space-x-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <BarChart className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Leaderboard</span>
            </NavLink>
            
            <NavLink
              to="/log"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <ListMinus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Log Meditation</span>
            </NavLink>
            
            <button
              onClick={signOut}
              className="ml-2 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;