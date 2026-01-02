import React from 'react';
import { Lock, Unlock, X, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const MealCard = ({ mealData, id, onLockToggle, onDelete, isLocked }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: id, disabled: isLocked });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const renderItem = (item, index) => {
        if (!item) return null;

        // Fix URL duplication for 'staple' logic
        const getSafeUrl = (url, category) => {
            if (!url) return null;
            let base = url.endsWith('/') ? url.slice(0, -1) : url;
            // Heuristic: If it's a staple, it seems to need duplication. 
            if (category === 'staple') {
                const parts = base.split('/');
                const name = parts[parts.length - 1];
                return `${base}/${name}/index.html`;
            }
            return `${base}/index.html`;
        };

        const safeUrl = getSafeUrl(item.url, item.category);

        return (
            <div key={`${item.name}-${index}`} className="mb-2 last:mb-0">
                <div className="flex justify-between items-baseline">
                    <span className="font-bold text-sm leading-tight truncate mr-2" title={item.name}>
                        {item.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1 rounded flex-shrink-0">
                        {item.category === 'breakfast' ? '早餐' :
                            item.category === 'meat_dish' ? '荤菜' :
                                item.category === 'vegetable_dish' ? '素菜' :
                                    item.category === 'aquatic' ? '水产' :
                                        item.category === 'soup' ? '汤' :
                                            item.category === 'staple' ? '主食' : item.category}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 mt-1">
                    {safeUrl && (
                        <a
                            href={safeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-black"
                        >
                            查看菜谱
                        </a>
                    )}
                    <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-black"
                    >
                        YouTube
                    </a>
                    <a
                        href={`https://search.bilibili.com/all?keyword=${encodeURIComponent(item.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-black"
                    >
                        B站
                    </a>
                </div>
            </div>
        );
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
        relative group flex flex-col justify-between
        border border-gray-900 bg-white p-2 h-full min-h-[100px]
        ${isLocked ? 'bg-gray-100' : 'hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}
        transition-shadow duration-200
      `}
        >
            <div className="flex justify-between items-start mb-1">
                {/* Drag Handle */}
                <div className="flex-1"></div>
                {!isLocked && (
                    <div {...attributes} {...listeners} className="cursor-grab hover:text-gray-600 absolute right-1 top-1 z-10">
                        <GripVertical size={14} />
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto mt-1 mb-2">
                {mealData.items && mealData.items.length > 0 ? (
                    mealData.items.map((item, idx) => renderItem(item, idx))
                ) : (
                    <span className="text-gray-400 text-xs italic">空</span>
                )}
            </div>

            <div className="flex justify-between items-end mt-auto pt-2 border-t border-gray-100/50">
                <button
                    onClick={() => onLockToggle(mealData._id)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title={isLocked ? "Unlock" : "Lock"}
                >
                    {isLocked ? <Lock size={12} /> : <Unlock size={12} className="text-gray-400" />}
                </button>

                <button
                    onClick={() => onDelete(mealData._id)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500"
                    title="Delete"
                >
                    <X size={12} />
                </button>
            </div>
        </div>
    );
};
