import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Copy, Plus, ChevronDown } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../utils/api';

export default function CreateMeal() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Meal general data
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Food items list
  const [items, setItems] = useState([
    { foodName: '', quantity: 100, unit: 'g', calories: 150, protein: 10, carbs: 20, fats: 5, fibre: 2 }
  ]);

  // Dynamic totals
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0, fibre: 0 });

  useEffect(() => {
    // Re-calculate totals dynamically
    const cals = items.reduce((sum, item) => sum + ((item.calories || 0)), 0);
    const pro = items.reduce((sum, item) => sum + ((item.protein || 0)), 0);
    const carbs = items.reduce((sum, item) => sum + ((item.carbs || 0)), 0);
    const fats = items.reduce((sum, item) => sum + ((item.fats || 0)), 0);
    const fibre = items.reduce((sum, item) => sum + ((item.fibre || 0)), 0);

    setTotals({
      calories: Math.round(cals),
      protein: Math.round(pro),
      carbs: Math.round(carbs),
      fats: Math.round(fats),
      fibre: Math.round(fibre)
    });
  }, [items]);

  const handleAddItem = () => {
    setItems(prev => [...prev, { foodName: '', quantity: 100, unit: 'g', calories: 0, protein: 0, carbs: 0, fats: 0, fibre: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleDuplicateItem = (index) => {
    const itemToDuplicate = { ...items[index] };
    setItems(prev => {
      const updated = [...prev];
      updated.splice(index + 1, 0, itemToDuplicate);
      return updated;
    });
  };

  const handleItemChange = (index, field, value) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [field]: field === 'foodName' || field === 'unit' ? value : Number(value)
        };
      }
      return item;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Meal Name is required");
      return;
    }

    const validItems = items.filter(i => i.foodName.trim() !== '');
    if (validItems.length === 0) {
      alert("Please add at least one food item.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: name,
        description: notes || "Homemade meal",
        mealType: mealType.toLowerCase(),
        date: new Date(date),
        notes,
        items: validItems
      };

      await api.post('/meals', payload);
      navigate('/meals');
    } catch (err) {
      console.error("Failed to save meal:", err);
      alert(err.response?.data?.message || "Failed to create meal. Please check fields.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-teal-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Meals
      </button>

      <div className="relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <h1 className="relative z-10 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-8">Create Custom Meal</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          
          {/* General Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input 
              label="Meal Name"
              placeholder="e.g., Post-Workout Oatmeal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            
            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-sm font-medium text-zinc-300">Meal Type</label>
              <div className="relative">
                <select 
                  className="flex h-11 w-full rounded-xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md px-4 py-2 text-base md:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300 appearance-none pr-10"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <Input 
              label="Log Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Dynamic Totals Summary Widget */}
          <div className="grid grid-cols-5 gap-4 bg-black/40 border border-zinc-850 p-5 rounded-2xl text-center">
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Total Calories</span>
              <span className="text-xl font-black text-white mt-1 block">{totals.calories} kcal</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block text-orange-400">Protein</span>
              <span className="text-xl font-black text-[#ff9800] mt-1 block">{totals.protein} g</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block text-emerald-400">Carbs</span>
              <span className="text-xl font-black text-[#00e676] mt-1 block">{totals.carbs} g</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block text-purple-400">Fats</span>
              <span className="text-xl font-black text-[#b200ff] mt-1 block">{totals.fats} g</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block text-teal-400">Fibre</span>
              <span className="text-xl font-black text-teal-400 mt-1 block">{totals.fibre} g</span>
            </div>
          </div>

          {/* Food items sub-list */}
          <div className="space-y-4 pt-6 border-t border-zinc-800/50">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-200">Ingredients / Food Items</h2>
              <button 
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 text-xs font-bold transition-all"
              >
                <Plus className="h-4 w-4" />
                Add Food Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div 
                  key={index}
                  className="bg-black/20 rounded-2xl border border-zinc-800/60 p-5 space-y-4 hover:border-zinc-700/80 transition-colors animate-[fade-in_0.2s_ease-out]"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-4">
                      <label className="text-xs font-bold text-zinc-500 block mb-1.5">Food / Ingredient Name</label>
                      <input 
                        type="text"
                        placeholder="e.g., Whole Wheat Bread"
                        value={item.foodName}
                        onChange={(e) => handleItemChange(index, 'foodName', e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-zinc-500 block mb-1.5">Quantity</label>
                      <input 
                        type="number"
                        placeholder="100"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2 text-xs text-white text-center focus:outline-none focus:border-teal-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-zinc-500 block mb-1.5">Unit</label>
                      <input 
                        type="text"
                        placeholder="g"
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2 text-xs text-white text-center focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-zinc-500 block mb-1.5">Calories (kcal)</label>
                      <input 
                        type="number"
                        placeholder="250"
                        value={item.calories}
                        onChange={(e) => handleItemChange(index, 'calories', e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2 text-xs text-white text-center focus:outline-none focus:border-teal-500"
                        required
                      />
                    </div>
                    
                    {/* Control Row: Protein, Carbs, Fats, Fibre */}
                    <div className="md:col-span-2 flex items-center justify-end gap-2 h-10">
                      <button 
                        type="button"
                        onClick={() => handleDuplicateItem(index)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all"
                        title="Duplicate Item"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        className="p-2 bg-white/5 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-400 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        title="Remove Item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 pt-2 border-t border-zinc-900">
                    <div>
                      <label className="text-xs font-semibold text-[#ff9800] block mb-1">Protein (g)</label>
                      <input 
                        type="number"
                        value={item.protein}
                        onChange={(e) => handleItemChange(index, 'protein', e.target.value)}
                        className="flex h-9 w-full rounded-lg border border-zinc-850 bg-zinc-950/40 text-center text-xs text-zinc-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#00e676] block mb-1">Carbs (g)</label>
                      <input 
                        type="number"
                        value={item.carbs}
                        onChange={(e) => handleItemChange(index, 'carbs', e.target.value)}
                        className="flex h-9 w-full rounded-lg border border-zinc-850 bg-zinc-950/40 text-center text-xs text-zinc-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#b200ff] block mb-1">Fats (g)</label>
                      <input 
                        type="number"
                        value={item.fats}
                        onChange={(e) => handleItemChange(index, 'fats', e.target.value)}
                        className="flex h-9 w-full rounded-lg border border-zinc-850 bg-zinc-950/40 text-center text-xs text-zinc-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-teal-400 block mb-1">Fibre (g)</label>
                      <input 
                        type="number"
                        value={item.fibre}
                        onChange={(e) => handleItemChange(index, 'fibre', e.target.value)}
                        className="flex h-9 w-full rounded-lg border border-zinc-850 bg-zinc-950/40 text-center text-xs text-zinc-200 focus:outline-none"
                      />
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Optional notes */}
          <div className="flex flex-col space-y-1.5 pt-6 border-t border-zinc-800/50">
            <label className="text-sm font-medium text-zinc-300">Meal Notes</label>
            <textarea 
              placeholder="e.g., High carb refuel post leg-session."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex min-h-[60px] w-full rounded-xl border border-zinc-800 bg-zinc-90/50 px-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 backdrop-blur-md"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-6 flex justify-end gap-3 border-t border-zinc-800/50">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating meal...' : 'Save Meal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}