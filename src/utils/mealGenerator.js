import recipesData from '../data/recipes.json';

// Group recipes by suitable meal time
// 1. Breakfast: Only 'breakfast' category
const breakfastRecipes = recipesData.filter(r => r.category === 'breakfast');

// 2. Main (Lunch/Dinner): 
// Pool includes: Meat, Veg, Aquatic, Soup, Semi-finished, Staple
const mainRecipes = recipesData.filter(r =>
    ['meat_dish', 'vegetable_dish', 'aquatic', 'soup', 'semi-finished', 'staple'].includes(r.category)
    && r.category !== 'drink'
);

// Translate Days to Chinese
export const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
export const MEALS = ['早餐', '午餐', '晚餐'];

const getRandomRecipe = (pool) => {
    if (pool.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
};

const getDishType = (dish) => {
    if (!dish) return null;
    const cat = dish.category;
    if (['meat_dish', 'aquatic', 'semi-finished'].includes(cat)) return 'meat';
    if (cat === 'vegetable_dish') return 'veg';
    if (cat === 'staple') return 'staple';
    if (cat === 'soup') return 'soup';
    return 'other';
};

export const generateMealCardData = (type) => {
    const isBreakfast = type === 'Breakfast';
    const pool = isBreakfast ? breakfastRecipes : mainRecipes;

    // Unique ID for the *Card* (not the recipe)
    const cardId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (isBreakfast) {
        // Breakfast now requires TWO dishes
        const r1 = getRandomRecipe(pool);
        let r2 = getRandomRecipe(pool);

        // Attempt to get a different dish
        let attempts = 0;
        while (r2 && r1 && r2.name === r1.name && attempts < 10) {
            r2 = getRandomRecipe(pool);
            attempts++;
        }

        return {
            _id: cardId,
            type: 'combo', // Breakfast is now combo too
            items: [r1, r2].filter(Boolean)
        };

    } else {
        // Lunch/Dinner: 2 dishes, avoid same Type
        const r1 = getRandomRecipe(pool);
        let r2 = getRandomRecipe(pool);

        let attempts = 0;
        // Check for duplicates OR type conflict
        // Conflict = Same Name OR Same Type (Meat=Meat, Veg=Veg, Staple=Staple)
        // Note: Soup+Soup is probably unlikely to happen often given distribution, but let's avoid it too.
        // Actually, Soup is fine to pair with anything, but maybe not two soups?
        // Let's enforce Strict Type Diff.

        while (
            r2 && r1 &&
            (r2.name === r1.name || getDishType(r1) === getDishType(r2)) &&
            attempts < 20
        ) {
            r2 = getRandomRecipe(pool);
            attempts++;
        }

        // Fallback: If after 20 attempts we failed match types (maybe pool is small?), just ensure distinct names
        if (r2 && r1 && r2.name === r1.name) {
            while (r2.name === r1.name && attempts < 30) {
                r2 = getRandomRecipe(pool);
                attempts++;
            }
        }

        return {
            _id: cardId,
            type: 'combo',
            items: [r1, r2].filter(Boolean)
        };
    }
};
