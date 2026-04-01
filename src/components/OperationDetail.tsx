import { useState } from 'react';
import { X, DollarSign, FileCheck, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface Operation {
  id: string;
  supplierId: string;
  supplierName: string;
  type: 'Remito' | 'Factura';
  status: 'pending' | 'ready' | 'alert' | 'closed';
  amount?: string;
  date: string;
  observations?: string;
}

interface OperationDetailProps {
  operation: Operation | null;
  onClose: () => void;
  onUpdate: (updatedOp: Operation) => void;
}

export function OperationDetail({ operation, onClose, onUpdate }: OperationDetailProps) {
  const [amount, setAmount] = useState(operation?.amount || '');
  const [loading, setLoading] = useState(false);

  if (!operation) return null;

  const handleCargarFactura = () => {
    if (!amount) return;
    onUpdate({
      ...operation,
      amount: amount.toString().startsWith('U$S') ? amount : `U$S ${amount}`,
      status: 'ready',
      date: 'Lista para pagar',
    });
    onClose();
  };

  const handlePagar = () => {
    setLoading(true);
    // Simulating upload
    setTimeout(() => {
      onUpdate({
        ...operation,
        status: 'closed',
        date: 'Pagado hoy',
      });
      setLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Detail Card / Modal */}
      <div className="relative w-full max-w-lg bg-surface rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Status Header Background */}
        <div className={`absolute top-0 left-0 right-0 h-2 ${
           operation.status === 'ready' ? 'bg-secondary' :
           operation.status === 'alert' ? 'bg-primary-fixed' :
           operation.status === 'closed' ? 'bg-on-secondary-fixed' : 'bg-primary'
        }`} />

        <div className="flex items-center justify-between mt-4 mb-6">
          <h2 className="text-xl font-display font-bold">Detalle de Operación</h2>
          <button onClick={onClose} className="text-on-surface/50">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
               operation.status === 'closed' ? 'bg-on-secondary-fixed/10' : 'bg-surface-container-high'
            }`}>
              {operation.status === 'closed' ? <CheckCircle className="text-on-secondary-fixed w-7 h-7" /> : 
               operation.status === 'ready' ? <DollarSign className="text-secondary w-7 h-7" /> :
               <FileCheck className="text-primary w-7 h-7" />}
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-on-surface">{operation.supplierName}</h3>
              <p className="text-on-surface/60 font-medium">{operation.type} • {operation.date}</p>
            </div>
          </div>

          {/* Observations if any */}
          {operation.observations && (
            <div className="p-4 bg-primary-fixed/10 rounded-2xl flex gap-3 border border-primary-fixed/20">
              <AlertTriangle className="text-primary-fixed w-5 h-5 shrink-0" />
              <p className="text-sm font-medium text-on-surface">
                {operation.observations}
              </p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface-container-low rounded-2xl">
              <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface/40 mb-1">Estado</p>
              <p className="font-semibold capitalize">{operation.status.replace('ready', 'Lista para pagar').replace('pending', 'En espera').replace('alert', 'Observada').replace('closed', 'Finalizada')}</p>
            </div>
            <div className="p-4 bg-surface-container-low rounded-2xl">
              <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface/40 mb-1">Monto</p>
              <p className="font-semibold text-lg">{operation.amount || 'Sin cargar'}</p>
            </div>
          </div>

          {/* Action Area based on status */}
          <div className="pt-4 border-t border-outline-variant/30">
            {(operation.status === 'pending' || operation.status === 'alert') && (
              <div className="space-y-4">
                <div>
                  <label className="form-label">Monto de la Factura (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40 font-bold">$</span>
                    <input 
                      type="number" 
                      className="form-input pl-8" 
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>
                <button onClick={handleCargarFactura} className="btn-primary w-full gap-2">
                  <ArrowRight className="w-5 h-5" />
                  Cargar Factura y Validar
                </button>
              </div>
            )}

            {operation.status === 'ready' && (
              <div className="space-y-4">
                <p className="text-sm text-center text-on-surface/50">¿Ya se realizó el pago?</p>
                <button 
                  onClick={handlePagar} 
                  disabled={loading}
                  className="btn-primary w-full gap-2 bg-gradient-to-r from-secondary to-secondary-container"
                >
                  <CheckCircle className="w-5 h-5" />
                  {loading ? 'Procesando...' : 'Registrar Pago y Cerrar'}
                </button>
              </div>
            )}

            {operation.status === 'closed' && (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-on-secondary-fixed/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="text-on-secondary-fixed w-6 h-6" />
                </div>
                <p className="font-bold text-on-surface">Operación Finalizada</p>
                <p className="text-sm text-on-surface/60">El pago y comprobante están registrados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
