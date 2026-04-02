import { useState, useEffect, useRef } from 'react';
import { formatCurrency } from './lib/utils';
import { FileText, CheckCircle2, Clock, Plus, Check, LogOut, UserCircle, DollarSign, CheckSquare, Square, Layers, Archive, Package, Truck, Camera, Image } from 'lucide-react';
import { supabase } from './lib/supabase';
import { LoginPage } from './components/LoginPage';
import { ReceptionForm } from './components/ReceptionForm';
import { OperationDetail } from './components/OperationDetail';
import { ProductsManager } from './components/ProductsManager';
import { SuppliersManager } from './components/SuppliersManager';
import { SupplierStatement } from './components/SupplierStatement';

export interface Supplier {
  id: string;
  name: string;
  initials: string;
  payment_term?: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  unit?: string;
}

export interface InvoiceItem {
  productId?: string;
  productName: string;
  quantity: string;
}

export interface Operation {
  id: string;
  supplierId: string;
  supplierName: string;
  type: 'Factura';
  status: 'pending' | 'ready' | 'closed';
  amount?: string;
  date: string;
  invoiceDate?: string;
  receptionDate?: string;
  observations?: string;
  expirationDate?: string;
  documentNumber?: string;
  invoiceImageUrl?: string;
  paymentVoucherUrl?: string;
  supplierReceiptNumber?: string;
  userEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  product?: string;
  quantity?: string;
  items?: InvoiceItem[];
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProductsManagerOpen, setIsProductsManagerOpen] = useState(false);
  const [isSuppliersManagerOpen, setIsSuppliersManagerOpen] = useState(false);
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);
  const [selectedSupplierForStatement, setSelectedSupplierForStatement] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'a_pagar' | 'sin_recibo' | 'cuentas' | 'historial'>('a_pagar');
  
  const [selectedInvoicesIds, setSelectedInvoicesIds] = useState<Set<string>>(new Set());
  const [receiptNumberBatch, setReceiptNumberBatch] = useState('');
  
  // Batch payment states
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const fileInputRefBatch = useRef<HTMLInputElement>(null);
  const cameraInputRefBatch = useRef<HTMLInputElement>(null);

  const isAdmin = session?.user?.email === 'fedeplevak@gmail.com';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchInitialData();
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchInitialData();
      else {
        setOperations([]);
        setSuppliers([]);
        setProducts([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: sups } = await supabase.from('suppliers').select('*');
      const { data: prods } = await supabase.from('products').select('*');
      const { data: ops } = await supabase.from('operations').select('*').order('created_at', { ascending: false });

      if (sups) setSuppliers(sups);
      if (prods) setProducts(prods);
      if (ops) {
        setOperations(ops.map(op => ({
          ...op,
          supplierId: op.supplier_id,
          supplierName: op.supplier_name,
          documentNumber: op.document_number,
          invoiceDate: op.invoice_date,
          receptionDate: op.reception_date,
          invoiceImageUrl: op.invoice_image_url,
          paymentVoucherUrl: op.payment_voucher_url,
          supplierReceiptNumber: op.supplier_receipt_number,
          items: op.items || [],
          userEmail: op.user_email,
          createdAt: op.created_at,
          updatedAt: op.updated_at
        })));
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    }
    setLoading(false);
  };

  const handleAddOperation = async (newOp: any) => {
    const { id, imageFile, imagePreview, ...operationData } = newOp;
    
    let imageUrl = null;
    
    if (imageFile) {
        // Upload image to Supabase Storage
        const fileExt = imageFile.name.split('.').pop() || 'jpg';
        const fileName = `invoice-${Date.now()}-${Math.random()}.${fileExt}`;
  
        const { error: uploadError } = await supabase.storage
          .from('invoices')
          .upload(fileName, imageFile);
  
        if (!uploadError) {
          const { data } = supabase.storage
            .from('invoices')
            .getPublicUrl(fileName);
          imageUrl = data.publicUrl;
        } else {
           console.error("Error uploading image:", uploadError);
           alert("Hubo un problema al subir la foto, pero la factura se guardará.");
        }
    }
    
    const { data, error } = await supabase
      .from('operations')
      .insert([{
        supplier_id: operationData.supplierId,
        supplier_name: operationData.supplierName,
        type: 'Factura',
        status: 'pending',
        date: operationData.receptionDate || new Date().toISOString().split('T')[0],
        invoice_date: operationData.invoiceDate,
        reception_date: operationData.receptionDate,
        amount: operationData.amount,
        observations: operationData.observations,
        document_number: operationData.documentNumber,
        invoice_image_url: imageUrl,
        items: operationData.items,
        user_id: session?.user?.id,
        user_email: session?.user?.email
      }])
      .select();

    if (error) {
      console.error('Error adding operation:', error);
      alert(`Error al guardar: ${error.message}`);
      return;
    }

    if (data) {
      setOperations([{
        ...data[0],
        supplierId: data[0].supplier_id,
        supplierName: data[0].supplier_name,
        documentNumber: data[0].document_number,
        invoiceDate: data[0].invoice_date,
        receptionDate: data[0].reception_date,
        invoiceImageUrl: data[0].invoice_image_url,
        paymentVoucherUrl: data[0].payment_voucher_url,
        supplierReceiptNumber: data[0].supplier_receipt_number,
        items: data[0].items || [],
        userEmail: data[0].user_email,
        createdAt: data[0].created_at,
        updatedAt: data[0].updated_at
      }, ...operations]);
    }
  };

  const handleUpdateOperation = async (updatedOp: Operation) => {
    const { error } = await supabase
      .from('operations')
      .update({
        status: updatedOp.status,
        amount: updatedOp.amount,
        date: updatedOp.date,
        observations: updatedOp.observations,
        supplier_id: updatedOp.supplierId,
        supplier_name: updatedOp.supplierName,
        document_number: updatedOp.documentNumber,
        invoice_date: updatedOp.invoiceDate,
        reception_date: updatedOp.receptionDate,
        invoice_image_url: updatedOp.invoiceImageUrl,
        payment_voucher_url: updatedOp.paymentVoucherUrl,
        supplier_receipt_number: updatedOp.supplierReceiptNumber,
        items: updatedOp.items
      })
      .eq('id', updatedOp.id);

    if (error) {
      console.error('Error updating operation:', error);
      alert(`Error al actualizar en la base de datos: ${error.message}`);
      return;
    }

    setOperations(operations.map(op => op.id === updatedOp.id ? updatedOp : op));
    setSelectedOp(null);
  };

  const submitBatchReceipt = async () => {
    if (!receiptNumberBatch) {
      alert("Ingrese el número de recibo del proveedor");
      return;
    }
    setBatchLoading(true);
    const idsToUpdate = Array.from(selectedInvoicesIds);
    
    for (let id of idsToUpdate) {
      await supabase.from('operations').update({
        status: 'closed',
        supplier_receipt_number: receiptNumberBatch
      }).eq('id', id);
    }
    
    await fetchInitialData();
    setSelectedInvoicesIds(new Set());
    setReceiptNumberBatch('');
    setBatchLoading(false);
  };

  const submitBatchPayment = async () => {
    if (!fileToUpload) return alert("Seleccione o tome una foto de comprobante de pago");
    setBatchLoading(true);
    try {
      const fileExt = fileToUpload.name.split('.').pop() || 'jpg';
      const fileName = `batch-${Date.now()}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment_vouchers')
        .upload(fileName, fileToUpload);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('payment_vouchers')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;
      const idsToUpdate = Array.from(selectedInvoicesIds);

      for (let id of idsToUpdate) {
        await supabase.from('operations').update({
          status: 'ready',
          payment_voucher_url: publicUrl
        }).eq('id', id);
      }
      
      await fetchInitialData();
      setSelectedInvoicesIds(new Set());
      setFileToUpload(null);
    } catch (e: any) {
      alert(`Error al procesar lote de pagos: ${e.message}`);
    }
    setBatchLoading(false);
  };

  const handleSignOut = () => supabase.auth.signOut();

  if (!session) return <LoginPage />;

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending': return <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-secondary bg-secondary/10 inline-block px-2 py-1 rounded-md">Pdte. Pago</div>;
      case 'ready': return <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-primary-fixed bg-primary-fixed/20 inline-block px-2 py-1 rounded-md">Pago Enviado</div>;
      case 'closed': return <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-on-secondary-fixed bg-on-secondary-fixed/10 inline-block px-2 py-1 rounded-md">Cerrado</div>;
      default: return <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-on-surface/50 bg-surface-container-high inline-block px-2 py-1 rounded-md">{status}</div>;
    }
  };

  const calculateDaysRemaining = (op: Operation) => {
    const sup = suppliers.find(s => s.id === op.supplierId);
    if (!sup || !op.receptionDate || sup.payment_term === undefined) return null;
    const reception = new Date(op.receptionDate);
    reception.setDate(reception.getDate() + sup.payment_term);
    const msDiff = reception.getTime() - new Date().getTime();
    const days = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
    return days;
  };

  const filteredOperations = () => {
    switch (activeTab) {
      case 'a_pagar': return operations.filter(o => o.status === 'pending');
      case 'sin_recibo': return operations.filter(o => o.status === 'ready');
      case 'historial': return operations.filter(o => o.status === 'closed');
      default: return [];
    }
  };

  return (
    <div className="min-h-screen bg-surface p-4">
      <header className="pt-8 pb-6 flex justify-between items-start">
        <div>
           <h1 className="text-3xl font-display font-bold text-on-surface">Tablero</h1>
           <div className="flex items-center gap-2 mt-1">
             <UserCircle className="w-4 h-4 text-primary" />
             <p className="text-on-surface/60 text-sm font-medium">
               {isAdmin ? 'Super Admin' : session.user.email}
             </p>
           </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsSuppliersManagerOpen(true)}
            className="w-11 h-11 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface hover:text-primary transition-colors shadow-sm"
            title="Directorio de Proveedores"
          >
            <Truck className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsProductsManagerOpen(true)}
            className="w-11 h-11 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface hover:text-primary transition-colors shadow-sm"
            title="Gestión de Insumos / Productos"
          >
            <Package className="w-5 h-5" />
          </button>
          <button 
            onClick={handleSignOut}
            className="w-11 h-11 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface hover:text-primary transition-colors shadow-sm"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="pb-32">
        {activeTab === 'cuentas' ? (
          <div>
            <h2 className="text-xl font-display font-bold mb-6">Deudas Activas (A Pagar)</h2>
            <div className="space-y-4">
              {suppliers
                .map(sup => {
                  const totalDebt = operations
                    .filter(o => o.supplierId === sup.id && o.status === 'pending')
                    .reduce((sum, o) => {
                      const price = parseFloat(o.amount?.replace(/[^0-9.]/g, '') || '0');
                      return sum + price;
                    }, 0);
                  return { sup, totalDebt };
                })
                .filter(item => item.totalDebt > 0)
                .sort((a, b) => b.totalDebt - a.totalDebt)
                .map(({ sup, totalDebt }) => (
                  <div 
                    key={sup.id} 
                    className="logistics-card flex items-center gap-4 bg-surface-container-low cursor-pointer hover:scale-[1.02] transition-transform shadow-sm"
                    onClick={() => setSelectedSupplierForStatement(sup)}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/10 text-primary font-black">
                      {sup.initials}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-on-surface">{sup.name}</h3>
                      <p className="text-sm text-on-surface/50">Plazo pago: {sup.payment_term || 0}d</p>
                    </div>
                    <div className="text-right">
                      <span className="font-display font-bold text-xl text-red-600">
                        {formatCurrency(totalDebt)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold">
                {activeTab === 'a_pagar' ? 'Facturas a Pagar' : activeTab === 'sin_recibo' ? 'Pendientes de Recibo' : 'Historial Cerrado'}
              </h2>
            </div>
            
            {activeTab === 'sin_recibo' && selectedInvoicesIds.size > 0 && (
              <div className="mb-4 bg-primary/10 border border-primary/30 p-4 rounded-2xl animate-in slide-in-from-top-4">
                <p className="font-bold mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Conciliar {selectedInvoicesIds.size} facturas con 1 recibo</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="N° de Recibo Proveedor" 
                    className="form-input flex-1"
                    value={receiptNumberBatch}
                    onChange={e => setReceiptNumberBatch(e.target.value)}
                  />
                  <button onClick={submitBatchReceipt} disabled={batchLoading} className="btn-primary text-sm px-4 whitespace-nowrap">
                    {batchLoading ? 'Cerrando...' : 'Guardar y Cerrar'}
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'a_pagar' && selectedInvoicesIds.size > 0 && (
              <div className="mb-4 bg-secondary/10 border border-secondary/30 p-4 rounded-2xl animate-in slide-in-from-top-4">
                <p className="font-bold mb-4 flex items-center gap-2 text-secondary">
                  <span className="bg-secondary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{selectedInvoicesIds.size}</span> Facturas seleccionadas para pago múltiple
                </p>
                
                {!fileToUpload ? (
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <button type="button" onClick={() => cameraInputRefBatch.current?.click()} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface hover:bg-secondary/20 text-secondary transition-colors border border-secondary/20 shadow-sm">
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Tomar Foto</span>
                    </button>
                    <button type="button" onClick={() => fileInputRefBatch.current?.click()} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface hover:bg-secondary/20 text-secondary transition-colors border border-secondary/20 shadow-sm">
                      <Image className="w-6 h-6 mb-1" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Subir Doc</span>
                    </button>
                  </div>
                ) : (
                  <div className="mb-4 bg-surface p-3 rounded-xl border border-secondary/20 flex flex-col items-center">
                    <p className="text-sm font-bold text-on-surface truncate flex items-center gap-2 w-full justify-center">
                      <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                      <span className="truncate">{fileToUpload.name}</span>
                    </p>
                    <button onClick={() => setFileToUpload(null)} className="text-[10px] uppercase text-error font-bold mt-2 hover:underline">Quitar adjunto</button>
                  </div>
                )}
                
                <input 
                  ref={cameraInputRefBatch} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                  onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)}
                />
                <input 
                  ref={fileInputRefBatch} type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
                  onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)}
                />

                <button 
                  onClick={submitBatchPayment} 
                  disabled={batchLoading || !fileToUpload} 
                  className="btn-primary bg-gradient-to-r from-secondary to-secondary-container text-white w-full text-sm mt-2 flex justify-center disabled:opacity-50"
                >
                  {batchLoading ? 'Procesando masivo...' : 'Pagar múltiples facturas'}
                </button>
              </div>
            )}

            <div className="space-y-4">
              {loading ? (
                 <div className="py-20 text-center animate-pulse">
                    <p className="text-on-surface/40 font-medium">Sincronizando datos...</p>
                 </div>
              ) : filteredOperations().length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-on-surface/40 bg-surface-container-low rounded-[40px] border-2 border-dashed border-outline-variant/20 shadow-inner">
                  <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4 opacity-50">
                     <Check className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-lg">Todo al día</p>
                </div>
              ) : (
                filteredOperations().map((op: Operation) => {
                  const daysRem = calculateDaysRemaining(op);
                  const productLabel = op.items && op.items.length > 0 
                    ? op.items.map(i => i.productName).join(', ') 
                    : op.product || 'Sin productos';

                  return (
                  <div 
                    key={op.id} 
                    className={`logistics-card flex items-start gap-4 transition-transform hover:bg-surface-container-low`}
                  >
                    {(activeTab === 'sin_recibo' || activeTab === 'a_pagar') && (
                       <button onClick={() => {
                          const newSet = new Set(selectedInvoicesIds);
                          if (newSet.has(op.id)) newSet.delete(op.id);
                          else newSet.add(op.id);
                          setSelectedInvoicesIds(newSet);
                       }} className={`mt-3 ${activeTab === 'a_pagar' ? 'text-secondary' : 'text-primary'}`}>
                          {selectedInvoicesIds.has(op.id) ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6 text-on-surface/30" />}
                       </button>
                    )}
                    <div onClick={() => setSelectedOp(op)} className="flex-1 flex gap-4 cursor-pointer">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative shadow-sm transition-colors ${
                        op.status === 'pending' ? 'bg-secondary/10' : 
                        op.status === 'ready' ? 'bg-primary-fixed/20' : 
                        'bg-on-secondary-fixed/10'
                      }`}>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-surface rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <FileText className="text-primary w-4 h-4" />
                        </div>
                        <span className={`text-sm font-black`}>
                          {suppliers.find(s => s.id === op.supplierId)?.initials || '??'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors truncate">{op.supplierName}</h3>
                          <span className="text-sm font-black font-display text-on-surface">{formatCurrency(op.amount)}</span>
                        </div>
                        <p className="text-sm text-on-surface/50 truncate flex items-center justify-between">
                          <span className="truncate">Fac {op.documentNumber} • {productLabel}</span>
                          {op.status === 'pending' && daysRem !== null && (
                            <span className={`font-bold text-xs px-2 py-0.5 rounded-full ml-2 shrink-0 ${daysRem < 0 ? 'bg-error/10 text-error' : daysRem < 3 ? 'bg-tertiary/10 text-tertiary' : 'bg-secondary/10 text-secondary'}`}>
                              {daysRem < 0 ? `Vencida (${Math.abs(daysRem)}d)` : `Vence en ${daysRem}d`}
                            </span>
                          )}
                        </p>
                        {getStatusChip(op.status)}
                      </div>
                    </div>
                  </div>
                )})
              )}
            </div>
          </>
        )}
      </main>

      <nav className="fixed bottom-6 left-6 right-6 h-16 glass-nav flex items-center justify-between px-6 rounded-[2rem] shadow-2xl z-50 overflow-hidden backdrop-blur-xl bg-surface-container-lowest/80 border border-outline-variant/10">
        <button onClick={() => { setActiveTab('a_pagar'); setSelectedInvoicesIds(new Set()); }} className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${activeTab === 'a_pagar' ? 'text-primary' : 'text-on-surface/40 hover:text-on-surface/70'}`}>
          <div className={`w-10 h-10 flex items-center justify-center rounded-full mb-0.5 transition-all ${activeTab === 'a_pagar' ? 'bg-primary/10 scale-110' : ''}`}><Clock className="w-5 h-5" /></div>
          <span className="text-[9px] font-bold uppercase tracking-widest">A Pagar</span>
        </button>
        <button onClick={() => { setActiveTab('sin_recibo'); setSelectedInvoicesIds(new Set()); }} className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${activeTab === 'sin_recibo' ? 'text-primary' : 'text-on-surface/40 hover:text-on-surface/70'}`}>
          <div className={`w-10 h-10 flex items-center justify-center rounded-full mb-0.5 transition-all ${activeTab === 'sin_recibo' ? 'bg-primary/10 scale-110' : ''}`}><Layers className="w-5 h-5" /></div>
          <span className="text-[9px] font-bold uppercase tracking-widest">Sin Recibo</span>
        </button>
        <button onClick={() => { setActiveTab('cuentas'); setSelectedInvoicesIds(new Set()); }} className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${activeTab === 'cuentas' ? 'text-primary' : 'text-on-surface/40 hover:text-on-surface/70'}`}>
          <div className={`w-10 h-10 flex items-center justify-center rounded-full mb-0.5 transition-all ${activeTab === 'cuentas' ? 'bg-primary/10 scale-110' : ''}`}><DollarSign className="w-5 h-5" /></div>
          <span className="text-[9px] font-bold uppercase tracking-widest">Cuentas</span>
        </button>
        <button onClick={() => { setActiveTab('historial'); setSelectedInvoicesIds(new Set()); }} className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${activeTab === 'historial' ? 'text-primary' : 'text-on-surface/40 hover:text-on-surface/70'}`}>
          <div className={`w-10 h-10 flex items-center justify-center rounded-full mb-0.5 transition-all ${activeTab === 'historial' ? 'bg-primary/10 scale-110' : ''}`}><Archive className="w-5 h-5" /></div>
          <span className="text-[9px] font-bold uppercase tracking-widest">Historial</span>
        </button>
      </nav>
      
      {isAdmin && (
        <button onClick={() => setIsFormOpen(true)} className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-[20px] shadow-xl shadow-primary/30 flex items-center justify-center text-white z-50 transition-all hover:scale-110 active:scale-95 group overflow-hidden">
          <Plus className="w-9 h-9 relative z-10" />
        </button>
      )}

      {/* Forms */}
      <ReceptionForm 
        isOpen={isFormOpen} 
        suppliers={suppliers}
        products={products}
        onClose={() => setIsFormOpen(false)} 
        onAdd={handleAddOperation}
        onAddSupplier={async (name: string) => {
          const initials = name.substring(0, 2).toUpperCase();
          const { data, error } = await supabase.from('suppliers').insert([{ name, initials }]).select();
          if (error) return { id: '', name: '', initials: '' };
          if (data && data[0]) {
            setSuppliers((prev: Supplier[]) => [...prev, data[0]]);
            return data[0];
          }
        }}
      />

      <ProductsManager
        isOpen={isProductsManagerOpen}
        onClose={() => setIsProductsManagerOpen(false)}
        products={products}
        refreshData={fetchInitialData}
      />

      <SuppliersManager
        isOpen={isSuppliersManagerOpen}
        onClose={() => setIsSuppliersManagerOpen(false)}
        suppliers={suppliers}
        refreshData={fetchInitialData}
      />

      {selectedOp && (
        <OperationDetail
          operation={selectedOp}
          onClose={() => setSelectedOp(null)}
          onUpdate={handleUpdateOperation}
        />
      )}

      {selectedSupplierForStatement && (
        <SupplierStatement
          supplier={selectedSupplierForStatement}
          operations={operations}
          onClose={() => setSelectedSupplierForStatement(null)}
        />
      )}
    </div>
  );
}

export default App;
