import React, { useState, useEffect } from 'react';
import { Goal } from '@/entities/Goal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Target, Plus, Trash2, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GoalsWidget() {
    const [goals, setGoals] = useState([]);
    const [newGoal, setNewGoal] = useState('');

    const loadGoals = async () => setGoals(await Goal.list('-created_date'));
    useEffect(() => { loadGoals() }, []);

    const addGoal = async (e) => {
        e.preventDefault();
        if (!newGoal.trim()) return;
        await Goal.create({ title: newGoal });
        setNewGoal('');
        loadGoals();
    };

    const toggleGoal = async (goal) => {
        await Goal.update(goal.id, { is_completed: !goal.is_completed });
        loadGoals();
    };

    const deleteGoal = async (id) => {
        await Goal.delete(id);
        loadGoals();
    };

    const completedGoals = goals.filter(g => g.is_completed).length;
    const progress = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;

    return (
        <div className="h-full">
            <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">أهدافي اليومية</h3>
                            <p className="text-white/50 text-xs">تتبع مهامك اليومية</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold text-lg">{completedGoals}</span>
                        <span className="text-white/40">/</span>
                        <span className="text-white/60">{goals.length}</span>
                    </div>
                </div>
            </div>
            
            <div className="p-4 space-y-4">
                {/* شريط التقدم */}
                <div className="relative">
                    <div className="flex justify-between items-center text-xs mb-2">
                        <span className="text-white/60">التقدم</span>
                        <span className="text-emerald-400 font-bold">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>
                    {progress === 100 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute -top-1 -left-1"
                        >
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                        </motion.div>
                    )}
                </div>
                
                {/* قائمة الأهداف */}
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    <AnimatePresence>
                        {goals.map((goal, idx) => (
                            <motion.div 
                                key={goal.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`flex items-center justify-between gap-3 p-3 rounded-xl transition-all cursor-pointer group ${
                                    goal.is_completed 
                                        ? 'bg-emerald-500/10 border border-emerald-500/30' 
                                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                }`}
                                onClick={() => toggleGoal(goal)}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                        goal.is_completed 
                                            ? 'bg-emerald-500 text-white' 
                                            : 'border-2 border-white/30 group-hover:border-emerald-400'
                                    }`}>
                                        {goal.is_completed ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-transparent" />
                                        )}
                                    </div>
                                    <span className={`text-sm transition-all ${
                                        goal.is_completed 
                                            ? 'line-through text-white/40' 
                                            : 'text-white'
                                    }`}>
                                        {goal.title}
                                    </span>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteGoal(goal.id);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                </Button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {goals.length === 0 && (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 mx-auto mb-3 bg-white/5 rounded-full flex items-center justify-center">
                                <Target className="w-6 h-6 text-white/20" />
                            </div>
                            <p className="text-white/40 text-sm">لا توجد أهداف بعد</p>
                        </div>
                    )}
                </div>
                
                {/* إضافة هدف جديد */}
                <form onSubmit={addGoal} className="flex gap-2">
                    <Input 
                        value={newGoal} 
                        onChange={(e) => setNewGoal(e.target.value)} 
                        placeholder="أضف هدفاً جديداً..." 
                        className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!newGoal.trim()}
                        className="h-10 w-10 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 rounded-xl shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}