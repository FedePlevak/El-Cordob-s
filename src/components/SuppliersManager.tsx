import React, { useState } from 'react';
import { X, Truck, Check, Trash2, Edit2, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Supplier } from '../App';

interface SuppliersManagerProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  refreshData: () => void;
}

export function SuppliersManager({ isOpen, onClose, suppliers, refreshData }: SuppliersManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [initials, setInitials] = useState('');
  const [paymentTerm, setPaymentTerm] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !initials) return;
    setLoading(true);

    try {
      if (editingId) {
        await supabase
          .from('suppliers')
          .update({ name, initials, payment_term: paymentTerm })
          .eq('id', editingId);
      } else {
        await supabase
          .from('suppliers')
          .insert([{ name, initials, payment_term: paymentTerm }]);
      }
      refreshData();
      resetForm();
    } catch (e) {
      console.error(e);
      alert('Error guardando proveedor');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este proveedor? Sus facturas asociadas podrían perder la referencia al nombre.')) {
      await supabase.from('suppliers').delete().eq('id', id);
      refreshData();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setInitials('');
    setPaymentTerm(0);
  };

  const editSupplier = (s: Supplier) => {
    setEditingId(s.id);
    setName(s.name);
    setInitials(s.initials);
    setPaymentTerm(s.payment_term || 0);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-surface rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
             <Truck className="w-6 h-6 text-primary" />
             Directorio de Proveedores
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="bg-surface-container-low p-4 rounded-2xl mb-6">
           <h3 className="font-bold mb-4">{editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
           
           <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="col-span-2">
                 <label className="text-[10px] uppercase font-bold text-on-surface/40">Nombre</label>
                 <input type="text" className="w-full bg-surface py-2 px-3 rounded-lg text-sm font-semibold outline-none ring-1 ring-outline-variant/30 focus:ring-primary shadow-sm" value={name} onChange={e => {
                    setName(e.target.value);
                    if(!editingId && e.target.value.length >= 2) {
                       setInitials(e.target.value.substring(0, 2).toUpperCase());
                    }
                 }} placeholder="Ej: Molinos" required />
              </div>
              <div className="col-span-1">
                 <label className="text-[10px] uppercase font-bold text-on-surface/40">Sigla / Icon</label>
                 <input type="text" maxLength={3} className="w-full bg-surface py-2 px-3 rounded-lg text-sm text-center uppercase font-black outline-none ring-1 ring-outline-variant/30 focus:ring-primary shadow-sm" value={initials} onChange={e => setInitials(e.target.value)} placeholder="MO" required />
              </div>
           </div>
           
           <div className="mb-4">
               <label className="text-[10px] uppercase font-bold text-on-surface/40 flex items-center gap-1">
                 <CreditCard className="w-3 h-3" /> Plazo de Pago del Proveedor (en Días)
               </label>
               <input type="number" min="0" className="w-full bg-surface py-2 px-3 rounded-lg text-sm font-semibold outline-none ring-1 ring-outline-variant/30 focus:ring-primary shadow-sm" value={paymentTerm} onChange={e => setPaymentTerm(parseInt(e.target.value) || 0)} placeholder="Ej: 15" />
               <p className="text-[10px] text-on-surface/50 mt-1">Este valor marcará a los cuántos días se considera vencida una factura desde su recepción.</p>
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
           <h3 className="font-bold text-on-surface/50 uppercase text-[10px] tracking-widest pl-2 mb-2">Proveedores Registrados ({suppliers.length})</h3>
           {suppliers.map(s => (
              <div key={s.id} className="p-3 bg-surface border border-outline-variant/10 rounded-2xl flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 font-black flex items-center justify-center shrink-0 text-primary">
                       {s.initials}
                    </div>
                    <div className="truncate">
                       <p className="font-bold text-sm truncate">{s.name}</p>
                       <p className="text-[10px] font-bold text-on-surface/50 truncate">
                         Crédito a {s.payment_term || 0} Días
                       </p>
                    </div>
                 </div>
                 <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => editSupplier(s)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-primary transition-colors">
                       <Edit2 className="w-4 h-4" />
                    </button>
                    {/* Ocultamos por seguridad a menos que tenga lógica de borrar cascada limpia */}
                 </div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
}
