"use client";
import { useState } from "react";
import { updateSucursal, deleteSucursal } from "@/lib/appActions";

export default function BranchList({ initialSucursales }) {
  const [sucursales, setSucursales] = useState(initialSucursales);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: "", direccion: "" });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEdit = (s) => {
    setEditingId(s.id);
    setEditForm({ nombre: s.nombre, direccion: s.direccion || "" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ nombre: "", direccion: "" });
  };

  const handleSave = async (id) => {
    setLoading(true);
    const res = await updateSucursal(id, editForm);
    if (res.success) {
      setSucursales(sucursales.map(s => s.id === id ? { ...s, ...editForm } : s));
      setEditingId(null);
      setMessage({ type: "success", text: "Sucursal actualizada correctamente" });
    } else {
      setMessage({ type: "error", text: "Error: " + res.error });
    }
    setLoading(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta sucursal?")) return;
    setLoading(true);
    const res = await deleteSucursal(id);
    if (res.success) {
      setSucursales(sucursales.filter(s => s.id !== id));
      setMessage({ type: "success", text: "Sucursal eliminada" });
    } else {
      setMessage({ type: "error", text: "Error: " + res.error });
    }
    setLoading(false);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50">
      {message && (
        <div className={`p-4 text-center text-xs font-black uppercase tracking-widest ${message.type === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
          {message.text}
        </div>
      )}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-900/50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-800">
            <th className="p-5 pl-8 w-20">ID</th>
            <th className="p-5">Nombre</th>
            <th className="p-5 text-right">Dirección</th>
            <th className="p-5 text-right pr-8">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {sucursales.length === 0 ? (
            <tr><td colSpan="4" className="p-10 text-center text-slate-500 font-medium">No hay sucursales registradas.</td></tr>
          ) : sucursales.map((s) => (
            <tr key={s.id} className="hover:bg-slate-800/30 transition-colors group">
              <td className="p-5 pl-8 text-slate-600 text-xs font-bold">#{s.id}</td>
              <td className="p-5">
                {editingId === s.id ? (
                  <input 
                    type="text" 
                    value={editForm.nombre}
                    onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 font-bold text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="font-bold tracking-tight text-slate-300">{s.nombre}</span>
                )}
              </td>
              <td className="p-5">
                {editingId === s.id ? (
                  <input 
                    type="text" 
                    value={editForm.direccion}
                    onChange={(e) => setEditForm({...editForm, direccion: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-xs font-medium text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-slate-500 text-xs font-medium">{s.direccion || "-"}</span>
                )}
              </td>
              <td className="p-5 pr-8 text-right">
                <div className="flex justify-end gap-2">
                  {editingId === s.id ? (
                    <>
                      <button 
                        onClick={() => handleSave(s.id)}
                        disabled={loading}
                        className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-all"
                        title="Guardar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                      <button 
                        onClick={handleCancel}
                        disabled={loading}
                        className="text-gray-400 hover:bg-gray-50 p-2 rounded-lg transition-all"
                        title="Cancelar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleEdit(s)}
                        className="text-blue-500 hover:bg-blue-500/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(s.id)}
                        className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Eliminar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
