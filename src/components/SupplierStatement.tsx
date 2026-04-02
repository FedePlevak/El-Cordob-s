import { X, FileText, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Supplier, Operation } from '../App';
import { useMemo } from 'react';
import { formatCurrency } from '../lib/utils';

interface SupplierStatementProps {
  supplier: Supplier;
  operations: Operation[];
  onClose: () => void;
}

export function SupplierStatement({ supplier, operations, onClose }: SupplierStatementProps) {
  // Generate movements
  const movements = useMemo(() => {
    const movs: any[] = [];
    for (const op of operations) {
      if (op.supplierId !== supplier.id) continue;
      
      const price = parseFloat(op.amount?.replace(/[^0-9.]/g, '') || '0');
      if (price === 0) continue;
      
      // Factura (Debt increases)
      movs.push({
        id: `inv-${op.id}`,
        date: op.receptionDate || op.date || op.createdAt || new Date().toISOString(),
        description: `Factura N° ${op.documentNumber || 'S/N'}`,
        amount: price,
        type: 'invoice',
        operation: op
      });
      
      // Pago (Debt decreases) if status is ready or closed
      if (op.status === 'ready' || op.status === 'closed') {
        const dateStr = Array.isArray(op.updatedAt) ? op.updatedAt[0] : (op.updatedAt || op.createdAt || op.receptionDate || op.date || new Date().toISOString());
        
        movs.push({
          id: `pay-${op.id}`,
          date: dateStr,
          description: `Pago (Ref. Fac N° ${op.documentNumber || 'S/N'})`,
          amount: -price,
          type: 'payment',
          operation: op
        });
      }
    }

    // Sort by date ascending (oldest first)
    movs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let balance = 0;
    return movs.map(m => {
      balance += m.amount;
      return { ...m, balance };
    });
  }, [operations, supplier.id]);

  const totalDebt = movements.length > 0 ? movements[movements.length - 1].balance : 0;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-surface sm:p-4">
      <div className="hidden sm:block absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full sm:max-w-2xl sm:mx-auto bg-surface sm:rounded-[32px] shadow-2xl flex flex-col h-full sm:h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/20 shrink-0">
          <div>
            <h2 className="text-2xl font-display font-bold text-on-surface">{supplier.name}</h2>
            <p className="text-on-surface/60 font-medium text-sm">Estado de Cuenta</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors text-on-surface">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 shrink-0 bg-surface-container-low border-b border-outline-variant/10">
          <p className="text-[10px] font-bold text-on-surface/50 uppercase tracking-widest mb-1">Saldo Actual</p>
          <div className={`text-4xl font-display font-black ${totalDebt > 0 ? 'text-red-600' : totalDebt < 0 ? 'text-green-600' : 'text-on-surface/50'}`}>
            {formatCurrency(totalDebt)}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {movements.map((m) => (
            <div key={m.id} className="bg-surface-container-low p-4 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${m.type === 'invoice' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                 {m.type === 'invoice' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
               </div>
               
               <div className="flex-1 min-w-0">
                 <p className="font-bold text-on-surface truncate text-sm">{m.description}</p>
                 <p className="text-xs text-on-surface/50 font-medium">
                    {new Date(m.date).toLocaleDateString('es-AR')}
                 </p>
               </div>
               
               <div className="text-right shrink-0">
                 <p className={`font-bold font-display text-sm ${m.type === 'invoice' ? 'text-red-600' : 'text-green-600'}`}>
                   {formatCurrency(m.amount, true)}
                 </p>
                 <p className={`text-xs font-semibold mt-0.5 ${m.balance > 0 ? 'text-red-600/70' : m.balance < 0 ? 'text-green-600/70' : 'text-on-surface/50'}`}>
                   Saldo: {formatCurrency(m.balance)}
                 </p>
               </div>
            </div>
          ))}
          {movements.length === 0 && (
             <div className="py-12 text-center text-on-surface/40">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-bold">No hay movimientos registrados</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
