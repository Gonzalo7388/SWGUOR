'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
  onClose: () => void;
  duration?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function Toast({ 
  message, 
  type, 
  show, 
  onClose, 
  duration = 3000 
}: ToastProps) {
  
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const config = {
    success: {
      icon: Check,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
    },
    info: {
      icon: AlertCircle,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
    },
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${bgColor} ${borderColor}`}
        >
          <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
          <button 
            onClick={onClose}
            className="ml-2 hover:opacity-70 transition-opacity"
          >
            <X className={`w-4 h-4 ${textColor}`} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}