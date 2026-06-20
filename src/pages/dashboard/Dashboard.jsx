import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, Utensils, Timer, Flame, Loader2, Sparkles } from 'lucide-react';
import { api } from '../../utils/api';

// Reusable progress bar component for macros
const MacroBar = ({ label, current, target, colorClass }) => {
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className="font-medium text-zinc-200">{Math.round(current)}g / {Math.round(target)}g</span>
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-800/50 overflow-hidden backdrop-blur-sm border border-zinc-800/50">
        <div 
          className={`h-full rounded-full ${colorClass} transition-all duration-1000 ease-out relative`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 blur-[2px]" />
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/dashboard');
        const dashData = res.data.data;
        if (!dashData.profile?.height || !dashData.profile?.weight) {
          navigate('/profile', { state: { needSetup: true } });
        } else {
          setData(dashData);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        if (err.response?.status === 404) {
          // Profile not found, redirect to profile setup
          navigate('/profile');
        } else {
          setError(err.response?.data?.message || "Failed to load dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
        <p className="text-zinc-400">Loading your fitness command center...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-red-400 font-semibold">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-emerald-500 text-zinc-950 rounded-full font-semibold hover:bg-emerald-400 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Calculate dynamic macro targets based on daily calorie target
  const calorieTarget = data.todayNutrition?.dailyTarget || 2000;
  const proteinTarget = Math.round((calorieTarget * 0.30) / 4);
  const carbsTarget = Math.round((calorieTarget * 0.45) / 4);
  const fatsTarget = Math.round((calorieTarget * 0.25) / 9);

  const caloriesConsumed = data.todayNutrition?.caloriesConsumed || 0;
  const caloriesBurned = data.todayNutrition?.caloriesBurned || 0;
  const bmiCurrent = data.bmi?.current ? Number(data.bmi.current).toFixed(1) : "N/A";
  const bmiCategory = data.bmi?.category || "Not Calculated";

  const mealDay = data.todaysMeal?.day || data.greeting?.today;
  const mealPlanMeals = data.todaysMeal?.meals || [];

  return (
    <div className="space-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      {/* Header */}
      <div className="relative flex justify-between items-center">
        <div>
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
            Welcome back, {data.greeting?.name || "Athlete"}
          </h1>
          <p className="mt-2 text-zinc-400">Here is your daily fitness and nutrition overview.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-zinc-300 font-semibold">{data.greeting?.today}</p>
          <p className="text-zinc-500 text-sm">{data.greeting?.date}</p>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Calorie Card */}
        <div className="group relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 md:col-span-2 shadow-xl backdrop-blur-xl transition-all hover:border-emerald-500/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
          <div className="relative z-10 flex items-end justify-between mb-8">
            <div>
              <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Calories Today</h3>
              <div className="mt-2 text-5xl font-bold text-white">
                {Math.round(caloriesConsumed)} <span className="text-2xl text-zinc-500 font-medium">/ {Math.round(calorieTarget)} kcal</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 grid grid-cols-3 gap-8 mt-4">
            <MacroBar 
              label="Protein" 
              current={data.todayNutrition?.macros?.protein || 0} 
              target={proteinTarget} 
              colorClass="bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
            />
            <MacroBar 
              label="Carbs" 
              current={data.todayNutrition?.macros?.carbs || 0} 
              target={carbsTarget} 
              colorClass="bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]" 
            />
            <MacroBar 
              label="Fats" 
              current={data.todayNutrition?.macros?.fats || 0} 
              target={fatsTarget} 
              colorClass="bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
            />
          </div>
        </div>

        {/* BMI Card */}
        <div className="group relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 flex flex-col justify-center items-center text-center shadow-xl backdrop-blur-xl transition-all hover:border-teal-500/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <h3 className="relative z-10 text-zinc-400 text-sm font-medium mb-4 uppercase tracking-wider">Current BMI</h3>
          <div className="relative z-10 text-6xl font-bold text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {bmiCurrent}
          </div>
          <span className="relative z-10 inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            {bmiCategory}
          </span>
        </div>
      </div>

      {/* Burn/Intake Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-xl">
          <p className="text-zinc-400 text-sm uppercase tracking-wider font-medium">Calories Consumed Today</p>
          <div className="mt-3 text-4xl font-bold text-white">{Math.round(caloriesConsumed)} kcal</div>
          <p className="mt-2 text-zinc-500 text-sm">Meals logged: {data.todayNutrition?.mealsLogged || 0}</p>
        </div>
        <div className="rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-xl">
          <p className="text-zinc-400 text-sm uppercase tracking-wider font-medium">Calories Burned Today</p>
          <div className="mt-3 text-4xl font-bold text-white">{Math.round(caloriesBurned)} kcal</div>
          <p className="mt-2 text-zinc-500 text-sm">Workout logs: {data.todayNutrition?.workoutsLogged || 0}</p>
        </div>
      </div>

      {/* Today's Plan Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Meals List */}
        <div className="rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6 border-b border-zinc-800/50 pb-4">
            <div>
              <h3 className="text-xl font-bold text-zinc-100">Today's Meal Plan</h3>
              <p className="text-sm text-zinc-500 mt-1">You are at this day: {mealDay}</p>
            </div>
            <Link to="/meals" className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {mealPlanMeals.length > 0 ? (
              mealPlanMeals.map((meal, index) => (
                <div key={index} className="group flex items-center justify-between rounded-xl bg-zinc-800/20 p-4 border border-zinc-800/50 hover:bg-zinc-800/40 hover:border-teal-500/30 transition-all duration-300">
                  <div>
                    <p className="font-semibold text-zinc-200 group-hover:text-teal-400 transition-colors">{meal.mealName || meal.title || meal.name || `Meal ${index + 1}`}</p>
                    <p className="text-xs text-zinc-400 mt-1">{meal.mealType || "Meal"} • {meal.protein || 0}g Protein</p>
                  </div>
                  <div className="text-right font-bold text-white bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-zinc-800">
                    {Math.round(meal.calories || 0)} kcal
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <p>No meals in today's plan.</p>
                <Link to="/meals/generate" className="text-sm text-teal-400 hover:underline mt-2 inline-block">
                  Generate AI Meal Plan
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Workout Info */}
        <div className="relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 flex flex-col items-center justify-center text-center shadow-xl backdrop-blur-xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          {data.todaysWorkout ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <Dumbbell className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-100">
                {data.todaysWorkout.isRestDay ? "Rest Day" : data.todaysWorkout.focus || "Today's Workout"}
              </h3>
              <p className="text-zinc-400 mt-2 mb-6">
                {data.todaysWorkout.isRestDay 
                  ? "Take some time to recover and recharge." 
                  : `${data.todaysWorkout.exercises?.length || 0} exercises planned for today.`}
              </p>
              
              {!data.todaysWorkout.isRestDay && (
                <div className="flex gap-4">
                  <Link to="/workouts">
                    <button className="px-6 py-2 bg-emerald-500 text-zinc-950 rounded-full text-sm font-bold hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      Start Workout
                    </button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-6 shadow-inner">
                <Dumbbell className="h-10 w-10 text-zinc-500 group-hover:text-emerald-400 transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-100">No workout plan loaded</h3>
              <p className="text-zinc-400 mt-2 mb-8 max-w-xs">Ready to crush your goals today? Let's design a training block.</p>
              <Link to="/workouts/generate">
                <button className="relative px-8 py-3 bg-emerald-500 text-zinc-950 rounded-full text-sm font-bold hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300">
                  Generate AI Workout
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}