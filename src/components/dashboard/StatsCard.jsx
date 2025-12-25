import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function StatsCard(props) {
  const { title = '', value = 0, icon: Icon = null, color = 'blue', isMobile = false, trend = null } = props || {};
  
  const colorClasses = {
    blue: { gradient: 'from-blue-500 to-blue-600', glow: 'blue-500/30', text: 'text-blue-400' },
    green: { gradient: 'from-emerald-500 to-green-600', glow: 'green-500/30', text: 'text-green-400' }, 
    orange: { gradient: 'from-amber-500 to-orange-600', glow: 'orange-500/30', text: 'text-orange-400' },
    purple: { gradient: 'from-purple-500 to-violet-600', glow: 'purple-500/30', text: 'text-purple-400' },
    red: { gradient: 'from-red-500 to-red-600', glow: 'red-500/30', text: 'text-red-400' }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -3 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-${colors.glow} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 md:p-5 overflow-hidden shadow-xl">
        {/* زخرفة خلفية */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/5 to-transparent rounded-tr-full"></div>
        
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <p className="text-white/60 text-xs md:text-sm font-medium mb-2">{title}</p>
            <p className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {typeof value === 'number' ? value.toLocaleString('ar-SA') : value || 0}
            </p>
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400 font-medium">{trend}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${colors.gradient} rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-6 h-6 md:w-7 md:h-7 text-white drop-shadow-md" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}