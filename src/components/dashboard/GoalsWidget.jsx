import React, { useState, useEffect } from 'react';
import { Goal } from '@/entities/Goal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Trash2 } from 'lucide-react';

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
        <Card className="shadow-md h-full mobile-card">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg mobile-title">
                    <Target className="text-green-600 w-4 h-4 md:w-5 md:h-5" />
                    <span>أهدافي اليومية</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {goals.map(goal => (
                        <div key={goal.id} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <Checkbox id={`goal-${goal.id}`} checked={goal.is_completed} onCheckedChange={() => toggleGoal(goal)} />
                                <label htmlFor={`goal-${goal.id}`} className={`text-sm ${goal.is_completed ? 'line-through text-gray-400' : ''}`}>{goal.title}</label>
                            </div>
                            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => deleteGoal(goal.id)}>
                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                            </Button>
                        </div>
                    ))}
                </div>
                <form onSubmit={addGoal} className="flex gap-2">
                    <Input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="أضف هدفاً جديداً..." className="h-9" />
                    <Button type="submit" size="icon" className="h-9 w-9"><Plus className="w-4 h-4" /></Button>
                </form>
                <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                        <span>التقدم</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            </CardContent>
        </Card>
    );
}