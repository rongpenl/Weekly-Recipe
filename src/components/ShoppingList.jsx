import React, { useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';

import { COMMON_ITEMS } from '../utils/commonItems';

export const ShoppingList = ({ weekPlan }) => {
    const ingredients = useMemo(() => {
        const counts = {};

        // weekPlan.all is array of mealData objects
        if (!weekPlan.all) return [];

        weekPlan.all.forEach(mealData => {
            if (!mealData || !mealData.items) return;

            mealData.items.forEach(dish => {
                if (!dish || !dish.ingredients) return;
                dish.ingredients.forEach(ing => {
                    const name = ing.trim();
                    // Filter common items
                    if (COMMON_ITEMS.includes(name)) return;

                    counts[name] = (counts[name] || 0) + 1;
                });
            });
        });

        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [weekPlan]);

    return (
        <div className="border-l border-gray-900 p-4 h-full bg-gray-50 overflow-y-auto w-64 flex-shrink-0">
            <div className="flex items-center gap-2 mb-4">
                <ShoppingCart size={20} />
                <h2 className="font-bold text-lg">采购清单</h2>
            </div>

            <div className="space-y-1">
                {ingredients.length === 0 ? (
                    <p className="text-gray-400 text-sm">暂无食材</p>
                ) : (
                    ingredients.map(([name, count]) => (
                        <div key={name} className="flex justify-between items-center text-sm border-b border-gray-200 py-1">
                            <span className="truncate pr-2" title={name}>{name}</span>
                            {count > 1 && <span className="text-xs font-mono bg-gray-200 px-1 rounded">{count}</span>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
