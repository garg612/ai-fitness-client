import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sparkles, Dumbbell, Timer, Flame, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../utils/api';

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/workouts/list');
      setWorkouts(res.data.data || []);
    } catch (err) {
      console.error("Failed to load workouts:", err);
      setError(err.response?.data?.message || "Failed to load workouts library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm("Are you sure you want to delete this workout routine?")) return;
    try {
      await api.delete(`/workouts/${workoutId}`);
      // Remove from state
      setWorkouts(prev => prev.filter(w => w._id !== workoutId));
    } catch (err) {
      console.error("Failed to delete workout:", err);
      alert("Failed to delete workout. Please try again.");
    }
  };

  return (
    <div className="space-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      {/* Header Actions */}
      <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Workouts Library</h1>
          <p className="mt-2 text-zinc-400">Manage your training splits and routines.</p>
        </div>
        <div className="relative z-10 flex gap-4 w-full sm:w-auto">
          <Link to="/workouts/generate" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              AI Generator
            </Button>
          </Link>
          <Link to="/workouts/create" className="flex-1 sm:flex-none">
            <Button className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Workout
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[30vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
          <p className="text-zinc-500">Loading workouts...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-400">{error}</p>
          <Button onClick={fetchWorkouts} className="mt-4">Retry</Button>
        </div>
      ) : workouts.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/20 border border-zinc-850 rounded-[2rem] backdrop-blur-md">
          <Dumbbell className="h-12 w-12 text-zinc-650 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-300">No workouts logged yet</h3>
          <p className="text-zinc-550 mt-1 mb-6">Create a custom workout or let the AI Architect generate a personalized weekly split.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/workouts/create">
              <Button size="sm">Create Custom Workout</Button>
            </Link>
            <Link to="/workouts/generate">
              <Button size="sm" variant="outline">Generate AI Workout</Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Workouts Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout) => {
            const displayType = workout.description || "Training Block";
            const caloriesBurned = workout.caloriesBurned || 300;

            return (
              <div key={workout._id} className="group relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:border-emerald-500/30 overflow-hidden cursor-pointer hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                
                <button onClick={(e) => { e.stopPropagation(); handleDeleteWorkout(workout._id); }} className="absolute top-6 right-6 z-20">
                  <Trash2 className="h-4 w-4 text-zinc-500 hover:text-red-400 transition-colors" />
                </button>

                <div className="relative z-10 flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-zinc-800/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors border border-zinc-700/50">
                      <Dumbbell className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-100">{workout.title}</h3>
                      <span className="text-xs text-emerald-500">{displayType}</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-3 gap-2 text-center bg-zinc-950/50 rounded-xl p-3 border border-zinc-800/50">
                  <div className="flex flex-col items-center">
                    <Timer className="h-4 w-4 text-emerald-500/70 mb-1" />
                    <p className="font-semibold text-zinc-200">{workout.duration}m</p>
                  </div>
                  <div className="flex flex-col items-center border-l border-r border-zinc-800/50">
                    <Flame className="h-4 w-4 text-orange-500 mb-1" />
                    <p className="font-semibold text-zinc-200">{Math.round(caloriesBurned)}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-zinc-500 mb-1 block h-4">Exs</span>
                    <p className="font-semibold text-zinc-200">{workout.exerciseCount || 0}</p>
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