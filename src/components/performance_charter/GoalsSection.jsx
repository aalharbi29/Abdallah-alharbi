import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

const DEFAULT_GOAL = {
  goal: '',
  measurement_criterion: '',
  relative_weight: 0,
  target_output: '',
  actual_output: 0,
  difference: 0,
  weighted_rating: 0
};

export default function GoalsSection({ goals, setGoals, showEvaluation = false }) {
  const addGoal = () => {
    setGoals([...goals, { ...DEFAULT_GOAL }]);
  };

  const removeGoal = (index) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const updateGoal = (index, field, value) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    
    if (showEvaluation && (field === 'actual_output' || field === 'target_output')) {
      const target = parseFloat(updated[index].target_output) || 0;
      const actual = parseFloat(updated[index].actual_output) || 0;
      updated[index].difference = actual - target;
    }
    
    setGoals(updated);
  };

  const totalWeight = goals.reduce((sum, g) => sum + (parseFloat(g.relative_weight) || 0), 0);
  const totalWeightedRating = goals.reduce((sum, g) => sum + (parseFloat(g.weighted_rating) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-green-700 text-white py-3 px-5 rounded-xl">
        <h3 className="text-lg font-bold">أولاً: الأهداف Part-1: The Goals</h3>
        <Button size="sm" variant="secondary" onClick={addGoal} className="gap-1">
          <Plus className="w-4 h-4" /> إضافة هدف
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" dir="rtl">
          <thead>
            <tr className="bg-green-50">
              <th className="border border-gray-300 p-2 w-10">#</th>
              <th className="border border-gray-300 p-2 min-w-[200px]">الهدف The Goal</th>
              <th className="border border-gray-300 p-2 min-w-[120px]">معيار القياس</th>
              <th className="border border-gray-300 p-2 w-24">الوزن النسبي</th>
              <th className="border border-gray-300 p-2 w-28">الناتج المستهدف</th>
              {showEvaluation && (
                <>
                  <th className="border border-gray-300 p-2 w-28">الناتج الفعلي</th>
                  <th className="border border-gray-300 p-2 w-28">الفرق</th>
                  <th className="border border-gray-300 p-2 w-28">التقدير الموزون</th>
                </>
              )}
              <th className="border border-gray-300 p-2 w-12">حذف</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((goal, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2 text-center font-bold">{index + 1}</td>
                <td className="border border-gray-300 p-1">
                  <Input
                    value={goal.goal}
                    onChange={(e) => updateGoal(index, 'goal', e.target.value)}
                    placeholder="أدخل الهدف..."
                    className="border-0 text-sm h-9"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <Input
                    value={goal.measurement_criterion}
                    onChange={(e) => updateGoal(index, 'measurement_criterion', e.target.value)}
                    placeholder="معيار القياس"
                    className="border-0 text-sm h-9"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={goal.relative_weight}
                    onChange={(e) => updateGoal(index, 'relative_weight', parseFloat(e.target.value) || 0)}
                    className="border-0 text-sm h-9 text-center"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <Input
                    value={goal.target_output}
                    onChange={(e) => updateGoal(index, 'target_output', e.target.value)}
                    placeholder="الناتج المستهدف"
                    className="border-0 text-sm h-9 text-center"
                  />
                </td>
                {showEvaluation && (
                  <>
                    <td className="border border-gray-300 p-1">
                      <Input
                        type="number"
                        value={goal.actual_output}
                        onChange={(e) => updateGoal(index, 'actual_output', parseFloat(e.target.value) || 0)}
                        className="border-0 text-sm h-9 text-center"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center font-semibold">
                      {goal.difference || 0}
                    </td>
                    <td className="border border-gray-300 p-1">
                      <Input
                        type="number"
                        step="0.01"
                        value={goal.weighted_rating}
                        onChange={(e) => updateGoal(index, 'weighted_rating', parseFloat(e.target.value) || 0)}
                        className="border-0 text-sm h-9 text-center"
                      />
                    </td>
                  </>
                )}
                <td className="border border-gray-300 p-1 text-center">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => removeGoal(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-green-50 font-bold">
              <td colSpan={3} className="border border-gray-300 p-2 text-center">
                مجموع الوزن النسبي (يجب أن يكون 100%)
              </td>
              <td className={`border border-gray-300 p-2 text-center ${Math.abs(totalWeight - 1) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                {(totalWeight * 100).toFixed(0)}%
              </td>
              <td className="border border-gray-300 p-2"></td>
              {showEvaluation && (
                <>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2 text-center text-blue-700">
                    {totalWeightedRating.toFixed(2)}
                  </td>
                </>
              )}
              <td className="border border-gray-300 p-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}