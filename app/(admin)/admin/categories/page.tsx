"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { getCategories, createCategory, deleteCategory } from "@/lib/firebase/firestore";
import { generateSlug } from "@/lib/utils";
import type { Category } from "@/types/category";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const loadCategories = () => {
    getCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(loadCategories, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await createCategory({
        name: newName.trim(),
        slug: generateSlug(newName.trim()),
        order: categories.length,
      });
      setNewName("");
      toast.success("Category added successfully");
      loadCategories();
    } catch {
      toast.error("Failed to add category");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete category "${name}"?`);
    if (!isConfirmed) return;
    
    try {
      await deleteCategory(id);
      toast.success("Category deleted successfully");
      loadCategories();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Categories</h1>
        <p className="text-zinc-400 text-xs mt-1">
          {categories.length} total categories for product catalog organization
        </p>
      </div>

      {/* Input bar section */}
      <div className="flex gap-3 bg-white p-4 border border-zinc-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Enter category name (e.g. T-Shirts, Hoodies)..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="w-full px-4 py-3 border border-zinc-100 rounded-xl text-xs bg-white focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-200/50 transition-all placeholder:text-zinc-400 font-medium"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-xl font-bold text-xs hover:bg-zinc-800 transition-all duration-300 shadow-md shadow-zinc-900/10 disabled:opacity-50"
        >
          {adding ? (
            <Spinner size="sm" className="border-white border-t-transparent" />
          ) : (
            <Plus size={14} />
          )}
          Add Category
        </button>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-48 space-y-4">
          <Spinner size="lg" />
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">Loading categories</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.015)] overflow-hidden">
          <div className="divide-y divide-zinc-100">
            {categories.length === 0 ? (
              <div className="px-6 py-16 text-center text-zinc-400 text-xs font-medium">
                No categories registered yet. Use the field above to add one.
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-6 py-4.5 hover:bg-zinc-50/40 transition-colors duration-300"
                >
                  <div>
                    <p className="font-bold text-xs text-zinc-950 capitalize">{cat.name}</p>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">slug: /{cat.slug}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 transition-all text-zinc-400 hover:text-red-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
