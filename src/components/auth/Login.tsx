import React from 'react';
import { FaGoogle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import Card from '../common/Card';
import Button from '../common/Button';
import { Loader } from 'lucide-react';

const Login: React.FC = () => {
  const { signIn, loading, error } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Meditation Tracker</h1>
            <p className="text-gray-600">Track and compare your meditation practice</p>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-center space-x-6 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-500 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold">H</span>
                </div>
                <p className="text-sm font-medium">Harsh</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <p className="text-sm font-medium">Arta</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              This is a private app for Harsh and Arta to track and compare their meditation practice.
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <Button
            onClick={signIn}
            className="flex items-center justify-center gap-2"
            fullWidth
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="animate-spin h-5 w-5" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <FaGoogle />
                <span>Sign in with Google</span>
              </>
            )}
          </Button>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;