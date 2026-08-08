"use client";

import { useState, useEffect, useCallback } from "react";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  sort_order: number;
}

type ApiFn = (url: string, options?: RequestInit) => Promise<Record<string, unknown> | null>;

const emptyForm = { name: "", description: "", price: "", duration_minutes: "" };

export default function ServicesManager({ api }: { api: ApiFn }) {
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);

  const load = useCallback(async () => {
    const data = await api("/api/admin/services");
    if (data) setServices((data.services as Service[]) || []);
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const startEdit = (s: Service) => {
    setEditingId(s.id);
    setEditForm({ name: s.name, description: s.description, price: String(s.price), duration_minutes: String(s.duration_minutes) });
  };

  const saveEdit = async (id: string) => {
    await api("/api/admin/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        name: editForm.name,
        description: editForm.description,
        price: parseFloat(editForm.price) || 0,
        duration_minutes: parseInt(editForm.duration_minutes) || 0,
      }),
    });
    setEditingId(null);
    load();
  };

  const toggleActive = async (s: Service) => {
    await api("/api/admin/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: s.id, is_active: !s.is_active }),
    });
    load();
  };

  const remove = async (id: string) => {
    await api(`/api/admin/services?id=${id}`, { method: "DELETE" });
    load();
  };

  const addService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.price || !addForm.duration_minutes) return;
    await api("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: addForm.name,
        description: addForm.description,
        price: parseFloat(addForm.price),
        duration_minutes: parseInt(addForm.duration_minutes),
        sort_order: services.length,
      }),
    });
    setAddForm(emptyForm);
    setShowAdd(false);
    load();
  };

  return (
    <div className="space-y-3">
      {services.map((s) => (
        <div key={s.id} className="bg-brand-charcoal border border-white/5 p-4 sm:p-5">
          {editingId === s.id ? (
            <div className="space-y-3">
              <input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Name"
                className="w-full bg-brand-dark border border-white/10 text-brand-white px-3 py-2 text-sm focus:border-brand-gold focus:outline-none"
              />
              <input
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Description"
                className="w-full bg-brand-dark border border-white/10 text-brand-white px-3 py-2 text-sm focus:border-brand-gold focus:outline-none"
              />
              <div className="flex gap-3">
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  placeholder="Price"
                  className="w-24 bg-brand-dark border border-white/10 text-brand-white px-3 py-2 text-sm focus:border-brand-gold focus:outline-none"
                />
                <input
                  type="number"
                  value={editForm.duration_minutes}
                  onChange={(e) => setEditForm({ ...editForm, duration_minutes: e.target.value })}
                  placeholder="Minutes"
                  className="w-28 bg-brand-dark border border-white/10 text-brand-white px-3 py-2 text-sm focus:border-brand-gold focus:outline-none"
                />
                <button onClick={() => saveEdit(s.id)} className="px-4 py-2 bg-brand-gold text-brand-black text-xs font-semibold uppercase tracking-wider hover:bg-brand-gold-light transition-colors">Save</button>
                <button onClick={() => setEditingId(null)} className="text-brand-muted text-xs hover:text-white transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-brand-white font-semibold">{s.name}</span>
                <span className="text-brand-muted text-sm ml-3">${s.price} &middot; {s.duration_minutes} min</span>
                {!s.is_active && <span className="ml-2 text-xs text-red-400">(inactive)</span>}
                {s.description && <p className="text-brand-muted/60 text-xs mt-1">{s.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(s)} className="px-3 py-1 text-xs bg-brand-gray text-brand-light hover:text-white transition-colors">Edit</button>
                <button onClick={() => toggleActive(s)} className="px-3 py-1 text-xs bg-brand-gray text-brand-light hover:text-white transition-colors">
                  {s.is_active ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => remove(s.id)} className="px-3 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {showAdd ? (
        <form onSubmit={addService} className="bg-brand-charcoal border border-brand-gold/30 p-4 sm:p-5 space-y-3">
          <input
            value={addForm.name}
            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
            placeholder="Service name"
            required
            className="w-full bg-brand-dark border border-white/10 text-brand-white px-3 py-2 text-sm focus:border-brand-gold focus:outline-none"
          />
          <input
            value={addForm.description}
            onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
            placeholder="Description"
            className="w-full bg-brand-dark border border-white/10 text-brand-white px-3 py-2 text-sm focus:border-brand-gold focus:outline-none"
          />
          <div className="flex gap-3">
            <input
              type="number"
              step="0.01"
              value={addForm.price}
              onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
              placeholder="Price ($)"
              required
              className="w-28 bg-brand-dark border border-white/10 text-brand-white px-3 py-2 text-sm focus:border-brand-gold focus:outline-none"
            />
            <input
              type="number"
              value={addForm.duration_minutes}
              onChange={(e) => setAddForm({ ...addForm, duration_minutes: e.target.value })}
              placeholder="Minutes"
              required
              className="w-28 bg-brand-dark border border-white/10 text-brand-white px-3 py-2 text-sm focus:border-brand-gold focus:outline-none"
            />
            <button type="submit" className="px-4 py-2 bg-brand-gold text-brand-black text-xs font-semibold uppercase tracking-wider hover:bg-brand-gold-light transition-colors">Add</button>
            <button type="button" onClick={() => setShowAdd(false)} className="text-brand-muted text-xs hover:text-white transition-colors">Cancel</button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-3 border border-dashed border-white/15 text-brand-muted text-sm hover:border-brand-gold/40 hover:text-brand-gold transition-colors"
        >
          + Add Service
        </button>
      )}
    </div>
  );
}
