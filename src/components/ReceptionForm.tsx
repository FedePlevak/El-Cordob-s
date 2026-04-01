import React, { useState } from 'react';
import { X, Camera, Check, Plus } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  initials: string;
}

interface ReceptionFormProps {
  isOpen: boolean;
  suppliers: Supplier[];
  onClose: () => void;
  onAdd: (operation: any) => void;
  onAddSupplier: (name: string) => Promise<any>;
}

export function ReceptionForm({ isOpen, suppliers, onClose, onAdd, onAddSupplier }: ReceptionFormProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [showNewSupplierInput, setShowNewSupplierInput] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [type, setType] = useState<'Remito' | 'Factura'>('Remito');
  const [observations, setObservations] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let supplierId = selectedSupplierId;
    let supplierName = "";

    if (showNewSupplierInput && newSupplierName) {
      const newSup = await onAddSupplier(newSupplierName);
      supplierId = newSup.id;
      supplierName = newSup.name;
    } else {
      const sup = suppliers.find(s => s.id === selectedSupplierId);
      if (!sup) return;
      supplierName = sup.name;
    }

    const newOperation = {
      id: Date.now().toString(),
      supplierId,
      supplierName,
      type,
      status: 'pending',
      date: 'Recién',
      observations,
    };

    onAdd(newOperation);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedSupplierId('');
    setNewSupplierName('');
    setShowNewSupplierInput(false);
    setObservations('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-surface rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold">Nueva Recepción</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier Selection */}
          <div>
            <label className="form-label">Proveedor</label>
            {!showNewSupplierInput ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {suppliers.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSupplierId(s.id)}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        selectedSupplierId === s.id 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-transparent bg-surface-container-low text-on-surface/60'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        selectedSupplierId === s.id ? 'bg-primary text-white' : 'bg-surface-container-high'
                      }`}>
                        {s.initials}
                      </div>
                      <span className="text-xs font-bold text-center leading-tight">{s.name}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowNewSupplierInput(true)}
                    className="p-4 rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 text-on-surface/40 hover:bg-surface-container-low transition-colors"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-xs font-bold">Nuevo</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Nombre del nuevo proveedor"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  autoFocus
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewSupplierInput(false)}
                  className="text-xs font-bold text-primary px-2"
                >
                  ← Volver a la lista
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
               {/* Document Type Toggle */}
                <div>
                    <label className="form-label">Tipo</label>
                    <div className="flex gap-1 p-1 bg-surface-container-low rounded-xl">
                    {(['Remito', 'Factura'] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setType(t)}
                            className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                                type === t ? 'bg-surface shadow-sm text-primary' : 'text-on-surface/40'
                            }`}
                        >
                        {t}
                        </button>
                    ))}
                    </div>
                </div>
                {/* Photo Button */}
                <div>
                     <label className="form-label">Comprobante</label>
                     <button type="button" className="w-full py-2.5 rounded-xl bg-surface-container-low border-2 border-dashed border-outline-variant flex items-center justify-center gap-2 text-on-surface/40 text-xs font-bold">
                        <Camera className="w-4 h-4" />
                        Foto
                     </button>
                </div>
          </div>

          {/* Observations */}
          <div>
            <label className="form-label">Observaciones</label>
            <textarea 
              className="form-input min-h-[80px] text-sm"
              placeholder="¿Faltó algo? ¿Llegó fuera de hora?"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={!showNewSupplierInput && !selectedSupplierId}
            className="btn-primary w-full gap-2 disabled:opacity-50"
          >
            <Check className="w-5 h-5" />
            Confirmar Recepción
          </button>
        </form>
      </div>
    </div>
  );
}
