import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Dumbbell, CheckCircle2 } from 'lucide-react';
import { api } from '../../utils/api';

const getTodayName = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });

export default function WorkoutDetail() {
  const { id } = useParams();
  const [workoutData, setWorkoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/workouts/${id}`);
        setWorkoutData(response.data.data);
      } catch (err) {
        console.error('Failed to load workout details:', err);
        setError(err.response?.data?.message || 'Failed to load workout details.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [id]);

  const workout = workoutData?.workout;
  const exercises = workoutData?.exercises || [];
  const weeklyPlan = Array.isArray(workout?.weeklyPlan) ? workout.weeklyPlan : [];
  const todayName = getTodayName();
  const isAIWorkout = weeklyPlan.length > 0;
  const totalExercises = isAIWorkout
    ? weeklyPlan.reduce((count, dayPlan) => count + (Array.isArray(dayPlan.exercises) ? dayPlan.exercises.length : 0), 0)
    : exercises.length;

  const totalCaloriesBurned = isAIWorkout
    ? weeklyPlan.reduce((count, dayPlan) => {
        const dayCalories = Array.isArray(dayPlan.exercises)
          ? dayPlan.exercises.reduce((sum, exercise) => sum + (exercise.caloriesBurned || 0), 0)
          : 0;
        return count + dayCalories;
      }, 0)
    : exercises.reduce((sum, exercise) => sum + (exercise.caloriesBurned || 0), 0);

  const handleLogWorkout = async () => {
    try {
      setIsLogging(true);
      setActionError('');
      setActionMessage('');
      await api.post(`/workouts/${id}/log`, {
        duration: workout.duration,
        caloriesBurned: totalCaloriesBurned || 300,
      });
      setActionMessage('Workout logged successfully.');
    } catch (err) {
      console.error('Failed to log workout:', err);
      setActionError(err.response?.data?.message || 'Failed to log workout.');
    } finally {
      setIsLogging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 text-center">
        <p className="text-red-400">{error}</p>
        <Link to="/workouts" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300">
          <ArrowLeft className="h-4 w-4" /> Back to Workouts
        </Link>
      </div>
    );
  }

  if (!workout) return null;

  const renderExerciseCard = (exercise, index) => (
    <div key={index} className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-zinc-100">{exercise.exerciseName || exercise.name || `Exercise ${index + 1}`}</p>
          <p className="text-sm text-zinc-500">{exercise.focus || exercise.muscleGroup || 'Workout movement'}</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-300">
          <span className="bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/50">{exercise.sets || 0} sets</span>
          <span className="bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/50">{exercise.reps || 0} reps</span>
          {(exercise.weight > 0 || exercise.weights > 0) && (
            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">{exercise.weight || exercise.weights} kg</span>
          )}
          <span className="bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/50">{(exercise.restTime || exercise.restSeconds || 0)}s rest</span>
          <span className="text-orange-400 font-semibold">{exercise.caloriesBurned || 0} kcal</span>
        </div>
      </div>
      {exercise.notes && (
        <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-2 italic">
          💡 Movement Tip: {exercise.notes}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <Link to="/workouts" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Workouts
      </Link>

      <div className="rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800/50 pb-6">
          <div>
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/10 p-4">
              <Dumbbell className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-white">{workout.title}</h1>
            <p className="mt-2 text-zinc-400">{workout.description || 'Workout plan details'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 p-4 text-sm">
            <div>
              <p className="text-zinc-500">Duration</p>
              <p className="font-semibold text-zinc-100">{workout.duration}m</p>
            </div>
            <div>
              <p className="text-zinc-500">Difficulty</p>
              <p className="font-semibold text-zinc-100 capitalize">{workout.difficulty}</p>
            </div>
            <div>
              <p className="text-zinc-500">Exercises</p>
              <p className="font-semibold text-zinc-100">{totalExercises}</p>
            </div>
            <div>
              <p className="text-zinc-500">Source</p>
              <p className="font-semibold text-zinc-100">{workout.generatedByAI ? 'AI Generated' : 'Manual'}</p>
            </div>
          </div>
        </div>

        {(actionMessage || actionError) && (
          <div className={`mt-6 rounded-xl p-4 text-sm border ${actionMessage ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {actionMessage || actionError}
          </div>
        )}

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-zinc-100">Workout Plan</h2>
          {isAIWorkout ? (
            <div className="grid gap-4">
              {weeklyPlan.map((dayPlan, index) => {
                const dayExercises = Array.isArray(dayPlan.exercises) ? dayPlan.exercises : [];
                const isToday = dayPlan.day === todayName;

                return (
                  <div
                    key={index}
                    className={`rounded-2xl border p-5 ${isToday ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-zinc-800/60 bg-zinc-950/40'}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/50 pb-4">
                      <div>
                        <p className="text-lg font-semibold text-zinc-100">
                          {dayPlan.day || `Day ${index + 1}`}
                        </p>
                        <p className="text-sm text-zinc-500">{dayPlan.focus || 'Workout day'}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isToday ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/60'}`}>
                        {isToday ? 'You are at this day' : dayPlan.isRestDay ? 'Rest Day' : 'Planned Day'}
                      </span>
                    </div>

                    {dayPlan.isRestDay ? (
                      <p className="mt-4 text-sm text-zinc-400">Take this day to recover and recharge.</p>
                    ) : dayExercises.length > 0 ? (
                      <div className="mt-4 grid gap-4">
                        {dayExercises.map((exercise, exerciseIndex) => renderExerciseCard(exercise, exerciseIndex))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-zinc-400">No exercises found for this day.</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : exercises.length > 0 ? (
            <div className="grid gap-4">
              {exercises.map((exercise, index) => renderExerciseCard(exercise, index))}
            </div>
          ) : (
            <p className="text-zinc-500">No exercises found.</p>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleLogWorkout}
            disabled={isLogging}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isLogging ? 'Logging...' : 'Log Workout'}
          </button>
        </div>
      </div>
    </div>
  );
}
