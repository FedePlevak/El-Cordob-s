import React, { useState } from 'react';
import { X, Package, Check, Trash2, Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../App';

interface ProductsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  refreshData: () => void;
}

export function ProductsManager({ isOpen, onClose, products, refreshData }: ProductsManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Unidad');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);

    try {
      if (editingId) {
        await supabase
          .from('products')
          .update({ name, unit, description })
          .eq('id', editingId);
      } else {
        await supabase
          .from('products')
          .insert([{ name, unit, description }]);
      }
      refreshData();
      resetForm();
    } catch (e) {
      console.error(e);
      alert('Error guardando producto');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este insumo?')) {
      await supabase.from('products').delete().eq('id', id);
      refreshData();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setUnit('Unidad');
    setDescription('');
  };

  const editProduct = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setUnit(p.unit || 'Unidad');
    setDescription(p.description || '');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-surface rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
             <Package className="w-6 h-6 text-primary" />
             Fichas de Productos
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="bg-surface-container-low p-4 rounded-2xl mb-6">
           <h3 className="font-bold mb-4">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
           <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                 <label className="text-[10px] uppercase font-bold text-on-surface/40">Nombre</label>
                 <input type="text" className="w-full bg-surface py-2 px-3 rounded-lg text-sm font-semibold outline-none ring-1 ring-outline-variant/30 focus:ring-primary shadow-sm" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Harina" required />
              </div>
              <div>
                 <label className="text-[10px] uppercase font-bold text-on-surface/40">Unidad de Medida</label>
                 <input type="text" className="w-full bg-surface py-2 px-3 rounded-lg text-sm font-semibold outline-none ring-1 ring-outline-variant/30 focus:ring-primary shadow-sm" value={unit} onChange={e => setUnit(e.target.value)} placeholder="Bolsa, Kg, Unidad" required />
              </div>
           </div>
           <div className="mb-4">
               <label className="text-[10px] uppercase font-bold text-on-surface/40">Descripción / Detalles (Ficha)</label>
               <input type="text" className="w-full bg-surface py-2 px-3 rounded-lg text-sm font-semibold outline-none ring-1 ring-outline-variant/30 focus:ring-primary shadow-sm" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej: Marca Pureza 0000 25kg" />
           </div>
           <div className="flex gap-2">
              <button type="submit" disabled={loading} className="btn-primary flex-1 py-2 text-sm gap-2">
                <Check className="w-4 h-4" /> {editingId ? 'Guardar Cambios' : 'Agregar'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl bg-surface-container-high text-sm font-bold">
                  Cancelar
                </button>
              )}
           </div>
        </form>

        <div className="flex-1 overflow-y-auto space-y-2">
           <h3 className="font-bold text-on-surface/50 uppercase text-[10px] tracking-widest pl-2 mb-2">Productos Registrados ({products.length})</h3>
           {products.map(p => (
              <div key={p.id} className="p-3 bg-surface border border-outline-variant/10 rounded-2xl flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                       <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div className="truncate">
                       <p className="font-bold text-sm truncate">{p.name}</p>
                       <p className="text-[10px] text-on-surface/50 truncate">Unidad: {p.unit || 'n/a'} {p.description ? `• ${p.description}` : ''}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => editProduct(p)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-primary transition-colors">
                       <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-error/10 text-error transition-colors">
                       <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
}
