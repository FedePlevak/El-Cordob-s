import React, { useState } from 'react';
import { X, Check, Plus, Trash2, ChevronDown, Package, Camera, Image as ImageIcon } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  initials: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  unit?: string;
}

interface InvoiceItem {
  id: string; // temp id
  productId: string;
  productName: string;
  quantity: string;
}

interface ReceptionFormProps {
  isOpen: boolean;
  suppliers: Supplier[];
  products: Product[];
  onClose: () => void;
  onAdd: (operation: any) => void;
  onAddSupplier: (name: string) => Promise<any>;
}

export function ReceptionForm({ isOpen, suppliers, products, onClose, onAdd, onAddSupplier }: ReceptionFormProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [showNewSupplierInput, setShowNewSupplierInput] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  
  const [documentNumber, setDocumentNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [receptionDate, setReceptionDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [observations, setObservations] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Multiple Lines State
  const [items, setItems] = useState<InvoiceItem[]>([
     { id: Date.now().toString(), productId: '', productName: '', quantity: '' }
  ]);

  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(i => i.productId && i.quantity);
    
    if (!documentNumber || !amount || validItems.length === 0) {
       alert('Nº Factura, Importe y al menos un Producto con su Cantidad son obligatorios');
       return;
    }
    
    let supplierId = selectedSupplierId;
    let supplierName = "";

    if (showNewSupplierInput && newSupplierName) {
      const newSup = await onAddSupplier(newSupplierName);
      if(!newSup.id) return;
      supplierId = newSup.id;
      supplierName = newSup.name;
    } else {
      const sup = suppliers.find(s => s.id === selectedSupplierId);
      if (!sup) {
          alert('Selecciona un proveedor');
          return;
      }
      supplierName = sup.name;
    }

    const newOperation = {
      id: Date.now().toString(),
      supplierId,
      supplierName,
      documentNumber,
      invoiceDate,
      receptionDate,
      amount: amount.replace(/[^0-9.]/g, ''),
      observations,
      items: validItems,
      imageFile,
      imagePreview
    };

    onAdd(newOperation);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedSupplierId('');
    setNewSupplierName('');
    setShowNewSupplierInput(false);
    setDocumentNumber('');
    setAmount('');
    setObservations('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setReceptionDate(new Date().toISOString().split('T')[0]);
    setItems([{ id: Date.now().toString(), productId: '', productName: '', quantity: '' }]);
    setActiveDropdownId(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string) => {
    setItems(items.map(item => {
       if (item.id === id) {
          if (field === 'productId') {
             const p = products.find(prod => prod.id === value);
             return { ...item, productId: value, productName: p ? p.name : '' };
          }
          return { ...item, [field]: value };
       }
       return item;
    }));
  };

  const addItem = () => setItems([...items, { id: Date.now().toString(), productId: '', productName: '', quantity: '' }]);
  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => { resetForm(); onClose(); }} />
      
      <div className="relative w-full max-w-lg bg-surface rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold">Ingresar Factura</h2>
          <button onClick={() => { resetForm(); onClose(); }} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier Selection */}
          <div>
            <label className="form-label">Proveedor</label>
            {!showNewSupplierInput ? (
              <div className="space-y-3">
                <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar scroll-smooth">
                  {suppliers.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSupplierId(s.id)}
                      className={`min-w-[80px] p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 flex-shrink-0 ${
                        selectedSupplierId === s.id 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-transparent bg-surface-container-low text-on-surface/60'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        selectedSupplierId === s.id ? 'bg-primary text-white' : 'bg-surface-container-high'
                      }`}>
                        {s.initials}
                      </div>
                      <span className="text-xs font-bold text-center leading-tight truncate w-full">{s.name}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowNewSupplierInput(true)}
                    className="min-w-[80px] p-3 rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-1 text-on-surface/40 hover:bg-surface-container-low transition-colors flex-shrink-0"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Nuevo</span>
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

          {/* Factura Details */}
          <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="form-label">Nº Factura</label>
                 <input 
                   type="text" 
                   className="form-input" 
                   placeholder="Ej: A-0001-123"
                   value={documentNumber}
                   onChange={(e) => setDocumentNumber(e.target.value)}
                 />
              </div>
              <div>
                 <label className="form-label">Importe Total (USD)</label>
                 <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/40 font-bold">$</span>
                   <input 
                     type="number" step="0.01"
                     className="form-input pl-8" 
                     placeholder="0.00"
                     value={amount}
                     onChange={(e) => setAmount(e.target.value)}
                   />
                 </div>
              </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="form-label">Fecha Factura</label>
                 <input 
                   type="date" 
                   className="form-input" 
                   value={invoiceDate}
                   onChange={(e) => setInvoiceDate(e.target.value)}
                 />
              </div>
              <div>
                 <label className="form-label">Fecha Recepción</label>
                 <input 
                   type="date" 
                   className="form-input" 
                   value={receptionDate}
                   onChange={(e) => setReceptionDate(e.target.value)}
                 />
              </div>
          </div>

          {/* Líneas de Factura */}
          <div>
             <div className="flex justify-between items-center mb-2">
                <label className="form-label !mb-0 text-primary">Líneas de la Factura</label>
             </div>
             
             <div className="space-y-3">
               {items.map((item) => {
                  const isDropdownOpen = activeDropdownId === item.id;
                  
                  return (
                    <div key={item.id} className="p-3 bg-surface-container-low rounded-[20px] flex gap-3 relative border border-transparent focus-within:border-primary/20">
                       <div className="w-20 shrink-0">
                          <label className="text-[10px] font-bold text-on-surface/40 uppercase tracking-widest pl-2 block mb-1">Cant.</label>
                          <input 
                            type="number" 
                            className="w-full bg-surface py-2.5 px-3 rounded-xl text-center font-bold outline-none ring-1 ring-outline-variant/30 focus:ring-primary border-none shadow-sm"
                            placeholder="0"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                          />
                       </div>
                       
                       <div className="flex-1 min-w-0">
                          <label className="text-[10px] font-bold text-on-surface/40 uppercase tracking-widest pl-2 block mb-1">Producto</label>
                          
                          {/* Custom Select Target */}
                          <div 
                             className="w-full bg-surface py-2.5 px-3 rounded-xl flex items-center justify-between cursor-pointer ring-1 ring-outline-variant/30 hover:ring-outline-variant shadow-sm"
                             onClick={() => setActiveDropdownId(isDropdownOpen ? null : item.id)}
                          >
                             <span className={`truncate font-medium ${!item.productId ? 'text-on-surface/40' : 'text-on-surface'}`}>
                               {item.productName || 'Toca para seleccionar...'}
                             </span>
                             <ChevronDown className={`w-4 h-4 text-on-surface/40 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                          </div>

                          {/* Dropdown Options */}
                          {isDropdownOpen && (
                             <>
                               {/* Backdrop to close dropdown */}
                               <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />
                               <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-surface shadow-xl rounded-2xl border border-outline-variant/20 p-2 max-h-48 overflow-y-auto">
                                  {products.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-on-surface/50">No hay productos precargados.</div>
                                  ) : (
                                    products.map(prod => (
                                      <button
                                        key={prod.id}
                                        type="button"
                                        onClick={() => {
                                           updateItem(item.id, 'productId', prod.id);
                                           setActiveDropdownId(null);
                                        }}
                                        className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-3"
                                      >
                                         <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                                            <Package className="w-4 h-4 text-on-surface/50" />
                                         </div>
                                         <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{prod.name}</p>
                                            <p className="text-[10px] text-on-surface/50 truncate">Unidad: {prod.unit || 'n/a'}</p>
                                         </div>
                                      </button>
                                    ))
                                  )}
                               </div>
                             </>
                          )}
                       </div>
                       
                       {items.length > 1 && (
                         <button 
                           type="button"
                           onClick={() => removeItem(item.id)}
                           className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-110 transition-all z-10"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       )}
                    </div>
                  );
               })}
             </div>
             
             <button 
               type="button" 
               onClick={addItem}
               className="mt-3 w-full py-3 rounded-[20px] border-2 border-dashed border-primary/20 text-primary font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
             >
               <Plus className="w-4 h-4" />
               Añadir otra línea
             </button>
          </div>

          <div>
            <label className="form-label">Observaciones (Opcional)</label>
            <textarea 
              className="form-input min-h-[60px] text-sm"
              placeholder="Ej: Falta media bolsa, etc."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
          </div>

          <div>
             <label className="form-label">Foto de la Factura (Opcional)</label>
             {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-outline-variant/20 bg-surface-container-low aspect-video flex items-center justify-center">
                   <img src={imagePreview} alt="Vista previa de factura" className="max-w-full max-h-full object-contain" />
                   <button 
                     type="button" 
                     onClick={() => { setImageFile(null); setImagePreview(null); }}
                     className="absolute top-2 right-2 w-8 h-8 rounded-full bg-surface text-on-surface shadow-md flex items-center justify-center hover:bg-error hover:text-white transition-colors"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             ) : (
                <div className="flex gap-3">
                   <label className="flex-1 py-4 border-2 border-dashed border-outline-variant/40 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-container-low transition-colors text-on-surface/60">
                      <Camera className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Cámara</span>
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
                   </label>
                   <label className="flex-1 py-4 border-2 border-dashed border-outline-variant/40 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-container-low transition-colors text-on-surface/60">
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Galería</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                   </label>
                </div>
             )}
          </div>

          <button 
            type="submit" 
            disabled={(!showNewSupplierInput && !selectedSupplierId)}
            className="btn-primary w-full gap-2 disabled:opacity-50"
          >
            <Check className="w-5 h-5" />
            Ingresar Factura
          </button>
        </form>
      </div>
    </div>
  );
}
