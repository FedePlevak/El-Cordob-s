import { useState, useRef } from 'react';
import { X, DollarSign, FileCheck, CheckCircle, AlertTriangle, ExternalLink, Camera, Image, User, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatCurrency, formatNumber } from '../lib/utils';

interface InvoiceItem {
  productId?: string;
  productName: string;
  quantity: string;
}

interface Operation {
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
  paymentVoucherUrl?: string;
  invoiceImageUrl?: string;
  supplierReceiptNumber?: string;
  // Audit
  userEmail?: string;
  createdAt?: string;
  // Legacy / new fields
  product?: string;
  quantity?: string;
  items?: InvoiceItem[];
}

interface OperationDetailProps {
  operation: Operation | null;
  onClose: () => void;
  onUpdate: (updatedOp: Operation) => void;
  onDelete?: (id: string) => void;
}

export function OperationDetail({ operation, onClose, onUpdate, onDelete }: OperationDetailProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!operation) return null;

  const handleUploadPayment = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${operation.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment_vouchers')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('payment_vouchers')
        .getPublicUrl(fileName);

      onUpdate({
        ...operation,
        status: 'ready',
        paymentVoucherUrl: data.publicUrl
      });
      onClose();
    } catch (e: any) {
      console.error(e);
      alert(`Error al subir el comprobante: ${e.message}`);
    }
    setLoading(false);
  };

  const lines = (operation.items && operation.items.length > 0) 
    ? operation.items 
    : (operation.product && operation.quantity ? [{ productName: operation.product, quantity: operation.quantity }] : []);

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Desconocido';
    const d = new Date(isoString);
    return d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-surface rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto flex flex-col">
        <div className={`absolute top-0 left-0 right-0 h-2 ${
           operation.status === 'pending' ? 'bg-secondary' :
           operation.status === 'ready' ? 'bg-primary-fixed' :
           'bg-on-secondary-fixed'
        }`} />

        <div className="flex items-center justify-between mt-4 mb-6">
          <h2 className="text-xl font-display font-bold">Detalle de Operación</h2>
          <div className="flex items-center gap-1">
             {onDelete && (
                <button onClick={() => setShowDeleteConfirm(true)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-error/10 text-on-surface/30 hover:text-error transition-colors">
                   <Trash2 className="w-5 h-5" />
                </button>
             )}
             <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors">
               <X className="w-5 h-5 text-on-surface" />
             </button>
          </div>
        </div>

        <div className="space-y-6 flex-1">
          {/* Header Info */}
          <div className="flex gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
               operation.status === 'closed' ? 'bg-on-secondary-fixed/10' : 'bg-surface-container-high'
            }`}>
              {operation.status === 'closed' ? <CheckCircle className="text-on-secondary-fixed w-7 h-7" /> : 
               operation.status === 'ready' ? <FileCheck className="text-primary-fixed w-7 h-7" /> :
               <DollarSign className="text-secondary w-7 h-7" />}
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-on-surface">{operation.supplierName}</h3>
              <p className="text-on-surface/60 font-medium">Fac {operation.documentNumber} • {formatCurrency(operation.amount)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Fechas */}
            <div className="p-4 bg-surface-container-low rounded-2xl flex justify-between items-center">
              <div>
                 <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface/40 mb-1">Emitida</p>
                 <p className="text-xs font-semibold">{operation.invoiceDate || operation.date}</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface/40 mb-1">Recibida</p>
                 <p className="text-xs font-semibold">{operation.receptionDate || operation.date}</p>
              </div>
            </div>
            
            {/* Líneas de Productos */}
            <div className="p-4 bg-surface-container-low rounded-2xl w-full">
              <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface/40 mb-3">Líneas de Factura</p>
                <div className="space-y-2">
                  {lines.map((l, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-outline-variant/10 pb-2 last:border-0 last:pb-0">
                      <span className="font-semibold text-sm">{l.productName}</span>
                      <span className="text-xs text-on-surface/70 font-bold bg-surface-container-high px-2 py-1 rounded-md">{formatNumber(l.quantity)}</span>
                    </div>
                  ))}
                  {lines.length === 0 && (
                    <div className="text-sm text-on-surface/40">Sin líneas de productos</div>
                  )}
                </div>
            </div>
          </div>

          {operation.observations && (
            <div className="p-4 bg-primary-fixed/10 rounded-2xl flex gap-3 border border-primary-fixed/20">
              <AlertTriangle className="text-primary-fixed w-5 h-5 shrink-0" />
              <p className="text-sm font-medium text-on-surface">
                {operation.observations}
              </p>
            </div>
          )}

          {operation.invoiceImageUrl && (
            <div className="flex justify-center mb-4">
              <a 
                href={operation.invoiceImageUrl} 
                target="_blank" 
                rel="noreferrer"
                className="btn-secondary w-full gap-2 border border-outline-variant/50 flex items-center justify-center font-bold"
              >
                <Image className="w-5 h-5 text-on-surface/50" />
                Ver Foto de Factura
                <ExternalLink className="w-4 h-4 text-on-surface/50 ml-auto" />
              </a>
            </div>
          )}

          <div className="pt-4 border-t border-outline-variant/30">
            {operation.status === 'pending' && (
              <div className="space-y-4">
                <p className="text-sm font-bold text-primary mb-2">Registrar Pago:</p>
                
                {/* Upload Section - Dual Options */}
                <div className="p-4 border-2 border-dashed border-outline-variant rounded-2xl bg-surface-container-low text-center">
                   
                   {!file ? (
                     <div className="grid grid-cols-2 gap-3 mb-2">
                       {/* Camera Button */}
                       <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center justify-center p-3 rounded-[20px] bg-primary/10 hover:bg-primary/20 text-primary transition-colors border border-primary/20">
                         <Camera className="w-8 h-8 mb-2" />
                         <span className="text-xs font-bold leading-tight">Tomar<br/>Foto</span>
                       </button>
                       {/* File Button */}
                       <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-3 rounded-[20px] bg-surface-container-high hover:bg-surface-container-highest transition-colors border border-outline-variant/50">
                         <Image className="w-8 h-8 mb-2 text-on-surface/60" />
                         <span className="text-xs font-bold leading-tight text-on-surface/80">Subir<br/>Archivo</span>
                       </button>
                     </div>
                   ) : (
                     <div className="pb-3 pt-1">
                        <CheckCircle className="w-8 h-8 text-secondary mx-auto mb-2" />
                        <p className="text-sm font-bold text-on-surface truncate px-4">{file.name}</p>
                        <button onClick={() => setFile(null)} className="text-xs text-error font-bold mt-2 hover:underline">Quitar y seleccionar otro</button>
                     </div>
                   )}
                   
                   {/* Hidden Inputs */}
                   <input 
                     ref={cameraInputRef}
                     type="file" 
                     accept="image/*"
                     capture="environment" // Forces camera on mobile
                     style={{ display: 'none' }}
                     onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                   />
                   <input 
                     ref={fileInputRef}
                     type="file" 
                     accept="image/*,application/pdf"
                     style={{ display: 'none' }}
                     onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                   />
                </div>
                
                <button 
                  onClick={handleUploadPayment}
                  disabled={loading || !file}
                  className="btn-primary w-full py-3 gap-2 bg-gradient-to-r from-secondary to-secondary-container text-white disabled:opacity-50"
                >
                  <DollarSign className="w-5 h-5" />
                  {loading ? 'Procesando comprobante...' : 'Marcar como Pagado y Subir'}
                </button>
              </div>
            )}

            {operation.status === 'ready' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 bg-primary-fixed/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileCheck className="text-primary-fixed w-6 h-6" />
                </div>
                <div>
                   <p className="font-bold text-on-surface">Pago Registrado</p>
                   <p className="text-sm text-on-surface/60">A la espera de recibir el recibo correspondiente por parte del proveedor.</p>
                </div>
                {operation.paymentVoucherUrl && (
                  <a href={operation.paymentVoucherUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-full hover:scale-105 transition-transform">
                    <ExternalLink className="w-4 h-4" />
                    Ver Comprobante Adjunto
                  </a>
                )}
              </div>
            )}

            {operation.status === 'closed' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 bg-on-secondary-fixed/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="text-on-secondary-fixed w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-on-surface">Factura Cerrada</p>
                  <p className="text-sm text-on-surface/60">Recibo Asociado: <span className="font-bold text-on-surface">{operation.supplierReceiptNumber}</span></p>
                </div>
                {operation.paymentVoucherUrl && (
                  <a href={operation.paymentVoucherUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-full hover:scale-105 transition-transform">
                    <ExternalLink className="w-4 h-4" />
                    Ver Comprobante de Pago
                  </a>
                )}
              </div>
            )}
          </div>
          
          {/* Audit Log Display */}
          <div className="mt-8 pt-4 border-t border-outline-variant/10 text-[10px] text-on-surface/40 flex flex-col gap-1 items-center justify-center">
             <div className="flex items-center gap-1.5 font-medium">
                <User className="w-3 h-3" /> Registrado por {operation.userEmail || 'Desconocido'}
             </div>
             <div>El {formatDateTime(operation.createdAt)}</div>
          </div>
        </div>
      </div>
      
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-surface/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center sm:rounded-[32px] rounded-t-[32px] animate-in fade-in duration-200">
           <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Trash2 className="w-10 h-10" />
           </div>
           <h3 className="text-2xl font-display font-black mb-3">¿Eliminar Factura?</h3>
           <p className="text-on-surface/60 mb-8 max-w-sm font-medium">
              Esta acción borrará este registro de la base de datos de forma permanente e irrecuperable.
           </p>
           <div className="flex gap-3 w-full max-w-xs">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="flex-1 py-3.5 bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded-xl font-bold text-on-surface"
              >
                Cancelar
              </button>
              <button 
                onClick={() => onDelete && onDelete(operation.id)} 
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-xl font-bold shadow-lg shadow-red-200"
              >
                Sí, Eliminar
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
