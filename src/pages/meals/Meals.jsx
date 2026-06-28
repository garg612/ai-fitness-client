import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Sparkles, Utensils, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../utils/api';

export default function Meals() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/meals');
      setMeals(res.data.data || []);
    } catch (err) {
      console.error("Failed to load meals:", err);
      setError(err.response?.data?.message || "Failed to load meals library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const handleDeleteMeal = async (mealId) => {
    if (!window.confirm("Are you sure you want to delete this meal plan?")) return;
    try {
      await api.delete(`/meals/${mealId}`);
      // Remove from local state
      setMeals(prev => prev.filter(meal => meal._id !== mealId));
    } catch (err) {
      console.error("Failed to delete meal:", err);
      alert("Failed to delete meal. Please try again.");
    }
  };

  return (
    <div className="space-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      {/* Header Actions */}
      <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">Meals Library</h1>
          <p className="mt-2 text-zinc-400">Manage your nutrition and custom recipes.</p>
        </div>
        <div className="relative z-10 flex gap-3 w-full sm:w-auto flex-wrap">
          <Link to="/meals/history" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full gap-2 hover:bg-white/5">
              History
            </Button>
          </Link>
          <Link to="/meals/generate" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              AI Generator
            </Button>
          </Link>
          <Link to="/meals/create" className="flex-1 sm:flex-none">
            <Button className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Meal
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[30vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
          <p className="text-zinc-500">Loading meals...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-400">{error}</p>
          <Button onClick={fetchMeals} className="mt-4">Retry</Button>
        </div>
      ) : meals.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-[2rem] backdrop-blur-2xl">
          <Utensils className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-300">No meals logged yet</h3>
          <p className="text-zinc-400 mt-1 mb-6">Create a custom meal or use the AI Routine architect to design a diet plan.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/meals/create">
              <Button size="sm">Add Custom Meal</Button>
            </Link>
            <Link to="/meals/generate">
              <Button size="sm" variant="outline">Generate AI Diet</Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Meals Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.map((meal) => {
            const displayType = meal.mealType 
              ? meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1) 
              : "Full Day";

            return (
              <div
                key={meal._id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/meals/${meal._id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/meals/${meal._id}`);
                  }
                }}
                className="group relative rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 shadow-2xl backdrop-blur-2xl transition-all hover:bg-white/[0.04] hover:border-white/10 overflow-hidden cursor-pointer hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                
                <button onClick={(e) => { e.stopPropagation(); handleDeleteMeal(meal._id); }} className="absolute top-6 right-6 z-20">
                  <Trash2 className="h-4 w-4 text-zinc-500 hover:text-red-400 transition-colors" />
                </button>
                
                <div className="relative z-10 flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/5 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors border border-white/5">
                      <Utensils className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-150">{meal.title}</h3>
                      <span className="text-xs text-zinc-550">{displayType}</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-4 gap-2 text-center bg-black/40 rounded-xl p-3 border border-white/5">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs text-zinc-500 mb-1">Cals</p>
                    <p className="font-semibold text-zinc-200">{Math.round(meal.totalCalories || meal.calories || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Pro</p>
                    <p className="font-semibold text-[#ff9800]">{Math.round(meal.protein || 0)}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Carb</p>
                    <p className="font-semibold text-[#00e676]">{Math.round(meal.carbs || 0)}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Fat</p>
                    <p className="font-semibold text-[#b200ff]">{Math.round(meal.fats || 0)}g</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}