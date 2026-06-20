import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Utensils, CheckCircle2 } from 'lucide-react';
import { api } from '../../utils/api';

const getTodayName = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });

export default function MealDetail() {
  const { id } = useParams();
  const [mealData, setMealData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyKey, setBusyKey] = useState('');

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/meals/${id}`);
        setMealData(response.data.data);
      } catch (err) {
        console.error('Failed to load meal details:', err);
        setError(err.response?.data?.message || 'Failed to load meal details.');
      } finally {
        setLoading(false);
      }
    };

    fetchMeal();
  }, [id]);

  const meal = mealData?.meal;
  const items = Array.isArray(mealData?.item) ? mealData.item : [];
  const todayName = getTodayName();

  const weeklyPlan = Array.isArray(meal?.weeklyPlan) && meal.weeklyPlan.length > 0
    ? meal.weeklyPlan
    : Array.isArray(meal?.meals) && meal.meals.length > 0
      ? meal.meals
      : items;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 text-center">
        <p className="text-red-400">{error}</p>
        <Link to="/meals" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300">
          <ArrowLeft className="h-4 w-4" /> Back to Meals
        </Link>
      </div>
    );
  }

  if (!meal) return null;

  const renderManualItems = () => items.map((item, index) => ({
    mealType: item.name || 'Ingredient',
    mealName: item.name || `Item ${index + 1}`,
    calories: item.calories || 0,
    protein: item.protein || 0,
    carbs: item.carbs || 0,
    fats: item.fats || 0,
    ingredients: item.ingredients || [],
    instructions: item.instructions || '',
  }));

  const handleLogMeal = async (payload, key) => {
    try {
      setBusyKey(key);
      setActionError('');
      setActionMessage('');
      await api.post(`/meals/${id}/consume`, payload);
      setActionMessage('Meal logged successfully.');
    } catch (err) {
      console.error('Failed to log meal:', err);
      setActionError(err.response?.data?.message || 'Failed to log meal.');
    } finally {
      setBusyKey('');
    }
  };

  return (
    <div className="space-y-8">
      <Link to="/meals" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-teal-400 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Meals
      </Link>

      <div className="rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800/50 pb-6">
          <div>
            <div className="mb-4 inline-flex rounded-2xl bg-teal-500/10 p-4">
              <Utensils className="h-8 w-8 text-teal-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-white">{meal.title}</h1>
            <p className="mt-2 text-zinc-400">{meal.description || 'Meal plan details'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 p-4 text-sm">
            <div>
              <p className="text-zinc-500">Calories</p>
              <p className="font-semibold text-zinc-100">{Math.round(meal.totalCalories || meal.dailyCalorieTarget || 0)}</p>
            </div>
            <div>
              <p className="text-zinc-500">Type</p>
              <p className="font-semibold text-zinc-100">{meal.mealType || 'Full Day'}</p>
            </div>
            <div>
              <p className="text-zinc-500">Protein</p>
              <p className="font-semibold text-blue-400">{Math.round(meal.protein || 0)}g</p>
            </div>
            <div>
              <p className="text-zinc-500">Carbs</p>
              <p className="font-semibold text-amber-400">{Math.round(meal.carbs || 0)}g</p>
            </div>
          </div>
        </div>

        {(actionMessage || actionError) && (
          <div className={`mt-6 rounded-xl p-4 text-sm border ${actionMessage ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {actionMessage || actionError}
          </div>
        )}

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-zinc-100">Meals / Items</h2>
          {weeklyPlan.length === 0 ? (
            <p className="text-zinc-500">No meal items found.</p>
          ) : (
            <div className="grid gap-4">
              {weeklyPlan[0]?.day ? (
                weeklyPlan.map((dayPlan, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl border p-5 ${dayPlan.day === todayName ? 'border-teal-500/50 bg-teal-500/10' : 'border-zinc-800/60 bg-zinc-950/40'}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/50 pb-4">
                      <div>
                        <p className="text-lg font-semibold text-zinc-100">{dayPlan.day || `Day ${index + 1}`}</p>
                        <p className="text-sm text-zinc-500">{dayPlan.meals?.length || 0} meals</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-zinc-300">
                          {Math.round(dayPlan.meals?.reduce((sum, mealItem) => sum + (mealItem.calories || 0), 0) || 0)} kcal
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${dayPlan.day === todayName ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/60'}`}>
                          {dayPlan.day === todayName ? 'You are at this day' : 'Planned Day'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4">
                      {(dayPlan.meals || []).map((mealItem, mealIndex) => (
                        <div key={mealIndex} className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-zinc-100">{mealItem.mealName || mealItem.name || mealItem.mealType || `Meal ${mealIndex + 1}`}</p>
                              <p className="text-sm text-zinc-500">{mealItem.mealType || 'Meal'}</p>
                            </div>
                            <div className="grid grid-cols-4 gap-3 text-sm text-zinc-300">
                              <span>{Math.round(mealItem.calories || 0)} kcal</span>
                              <span className="text-blue-400">{Math.round(mealItem.protein || 0)}g P</span>
                              <span className="text-amber-400">{Math.round(mealItem.carbs || 0)}g C</span>
                              <span className="text-red-400">{Math.round(mealItem.fats || 0)}g F</span>
                            </div>
                          </div>
                          {Array.isArray(mealItem.ingredients) && mealItem.ingredients.length > 0 && (
                            <div className="mt-3 text-sm text-zinc-400">
                              <span className="font-medium text-zinc-300">Ingredients:</span> {mealItem.ingredients.join(', ')}
                            </div>
                          )}
                          {mealItem.instructions && (
                            <p className="mt-3 text-sm leading-6 text-zinc-400">{mealItem.instructions}</p>
                          )}
                          {dayPlan.day === todayName && (
                            <div className="mt-4 flex justify-end">
                              <button
                                type="button"
                                disabled={busyKey === `${dayPlan.day}-${mealIndex}`}
                                onClick={() => handleLogMeal({ day: dayPlan.day, mealType: mealItem.mealType || 'Meal' }, `${dayPlan.day}-${mealIndex}`)}
                                className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-teal-400 disabled:opacity-50"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                {busyKey === `${dayPlan.day}-${mealIndex}` ? 'Logging...' : 'Log Meal'}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                renderManualItems().map((item, index) => (
                  <div key={index} className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-zinc-100">{item.mealName || item.mealType || `Meal ${index + 1}`}</p>
                        <p className="text-sm text-zinc-500">{item.mealType || 'Meal'}</p>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm text-zinc-300">
                        <span>{Math.round(item.calories || 0)} kcal</span>
                        <span className="text-blue-400">{Math.round(item.protein || 0)}g P</span>
                        <span className="text-amber-400">{Math.round(item.carbs || 0)}g C</span>
                        <span className="text-red-400">{Math.round(item.fats || 0)}g F</span>
                      </div>
                    </div>
                    {Array.isArray(item.ingredients) && item.ingredients.length > 0 && (
                      <div className="mt-4 text-sm text-zinc-400">
                        <span className="font-medium text-zinc-300">Ingredients:</span> {item.ingredients.join(', ')}
                      </div>
                    )}
                    {item.instructions && (
                      <p className="mt-3 text-sm leading-6 text-zinc-400">{item.instructions}</p>
                    )}
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        disabled={busyKey === `manual-${index}`}
                        onClick={() => handleLogMeal({}, `manual-${index}`)}
                        className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-teal-400 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {busyKey === `manual-${index}` ? 'Logging...' : 'Log Meal'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
