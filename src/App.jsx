import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { RefreshCw, Trash2, Github } from 'lucide-react';

import { MealCard } from './components/MealCard';
import { ShoppingList } from './components/ShoppingList';
import { generateMealCardData, DAYS } from './utils/mealGenerator';

const TOTAL_SLOTS = 21; // 7 days * 3 meals

function App() {
  const [cells, setCells] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Initialize
  useEffect(() => {
    handleGenerate(true);
    setInitialized(true);
  }, []);

  const getMealType = (index) => {
    if (index < 7) return 'Breakfast';
    return 'Main'; // Lunch and Dinner use main dishes
  };

  const handleGenerate = (forceAll = false) => {
    setCells(prev => {
      const newCells = prev.length === TOTAL_SLOTS ? [...prev] : Array(TOTAL_SLOTS).fill(null);

      for (let i = 0; i < TOTAL_SLOTS; i++) {
        const existing = newCells[i];
        // If it exists, is locked, and we are not forcing all (initial load), skip
        if (!forceAll && existing && existing.locked) {
          continue;
        }

        // Generate new
        const type = getMealType(i);
        const mealData = generateMealCardData(type);

        newCells[i] = {
          id: `cell-${i}-${Date.now()}-${Math.random()}`,
          data: mealData, // Changed from 'recipe' to 'data' to reflect structure
          locked: false,
          dayIndex: i % 7,
          mealRow: Math.floor(i / 7)
        };
      }
      return newCells;
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCells((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleLock = (id) => {
    setCells(cells.map(c =>
      c.id === id ? { ...c, locked: !c.locked } : c
    ));
  };

  const deleteCell = (id) => {
    // Empty the data
    setCells(cells.map(c =>
      c.id === id ? { ...c, data: { _id: c.data._id, items: [] }, locked: true } : c
    ));
  };

  // Prepare struct for ShoppingList
  const weekPlanForShopping = {
    all: cells.map(c => c.data).filter(Boolean)
  };

  if (!initialized) return <div className="p-10">Loading...</div>;

  return (
    <div className="flex h-screen w-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-900 bg-white z-10">
          <h1 className="text-2xl font-black tracking-tighter uppercase">本周吃什么 / Weekly Recipe</h1>
          <div className="flex gap-4">
            <button
              onClick={() => handleGenerate(false)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors font-bold uppercase text-xs tracking-wider"
            >
              <RefreshCw size={14} />
              随机生成
            </button>
          </div>
        </header>

        {/* Grid Header (Days) */}
        <div className="flex border-b border-gray-900 bg-gray-100 flex-shrink-0">
          <div className="w-20 flex-shrink-0"></div>
          <div className="flex-1 grid grid-cols-7">
            {DAYS.map(day => (
              <div key={day} className="py-2 text-center font-bold text-xs uppercase tracking-widest text-gray-500">
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Grid Area */}
        <div className="flex-1 overflow-auto p-4 flex">
          {/* Row Headers */}
          <div className="w-20 flex-shrink-0 grid grid-rows-3 gap-2 pr-2 text-xs font-bold text-gray-400 uppercase tracking-widest text-right pb-1 pt-2">
            <div className="flex items-center justify-end">早餐</div>
            <div className="flex items-center justify-end">午餐</div>
            <div className="flex items-center justify-end">晚餐</div>
          </div>

          <div className="flex-1 min-w-0 pb-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={cells.map(c => c.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-7 gap-2 grid-rows-3 h-full min-h-[500px]">
                  {cells.map((cell) => (
                    <MealCard
                      key={cell.id}
                      id={cell.id}
                      mealData={cell.data || { _id: "empty", items: [] }} // Handle null data
                      isLocked={cell.locked}
                      onLockToggle={() => toggleLock(cell.id)}
                      onDelete={() => deleteCell(cell.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>      </div>

      {/* Sidebar - Shopping List */}
      <ShoppingList weekPlan={weekPlanForShopping} />
    </div>
  );
}

export default App;
