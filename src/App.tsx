import { useState, useEffect } from 'react';
import { FileText, CheckCircle2, AlertCircle, Clock, Plus, Check, LogOut, UserCircle } from 'lucide-react';
import { supabase } from './lib/supabase';
import { LoginPage } from './components/LoginPage';
import { ReceptionForm } from './components/ReceptionForm';
import { OperationDetail } from './components/OperationDetail';

interface Supplier {
  id: string;
  name: string;
  initials: string;
}

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

function App() {
  const [session, setSession] = useState<any>(null);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);
  const [loading, setLoading] = useState(true);

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
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: sups } = await supabase.from('suppliers').select('*');
      const { data: ops } = await supabase.from('operations').select('*').order('created_at', { ascending: false });

      if (sups) setSuppliers(sups);
      if (ops) setOperations(ops);
    } catch (e) {
      console.error('Error fetching data:', e);
    }
    setLoading(false);
  };

  const handleAddOperation = async (newOp: Operation) => {
    const { data, error } = await supabase
      .from('operations')
      .insert([{
        ...newOp,
        status: newOp.observations ? 'alert' : 'pending',
        user_id: session?.user?.id
      }])
      .select();

    if (!error && data) {
      setOperations([data[0], ...operations]);
    }
  };

  const handleUpdateOperation = async (updatedOp: Operation) => {
    const { error } = await supabase
      .from('operations')
      .update({
        status: updatedOp.status,
        amount: updatedOp.amount,
        date: updatedOp.date,
        observations: updatedOp.observations
      })
      .eq('id', updatedOp.id);

    if (!error) {
      setOperations(operations.map(op => 
        op.id === updatedOp.id ? updatedOp : op
      ));
    }
    setSelectedOp(null);
  };

  const handleSignOut = () => supabase.auth.signOut();

  if (!session) {
    return <LoginPage />;
  }

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'ready': return <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-secondary bg-secondary/10 inline-block px-2 py-1 rounded-md">Lista para pagar</div>;
      case 'alert': return <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-primary-fixed bg-primary-fixed/20 inline-block px-2 py-1 rounded-md">Recepción observada</div>;
      case 'closed': return <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-on-secondary-fixed bg-on-secondary-fixed/10 inline-block px-2 py-1 rounded-md">Pagado</div>;
      default: return <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-on-surface/50 bg-surface-container-high inline-block px-2 py-1 rounded-md">Pendiente revisión</div>;
    }
  };

  return (
    <div className="min-h-screen bg-surface p-4">
      {/* Header */}
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
        <button 
          onClick={handleSignOut}
          className="w-11 h-11 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface hover:text-primary transition-colors shadow-sm"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface-container-low rounded-[28px] p-5 flex flex-col justify-between h-36 border border-outline-variant/10">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="text-primary w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface/40 mb-1">Pendientes</p>
            <p className="text-4xl font-display font-bold">{operations.filter((o: Operation) => o.status === 'pending' || o.status === 'alert').length}</p>
          </div>
        </div>
        <div className="bg-surface-container-low rounded-[28px] p-5 flex flex-col justify-between h-36 border border-outline-variant/10">
          <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
            <Clock className="text-tertiary w-5 h-5" />
          </div>
          <div>
             <p className="text-xs font-bold uppercase tracking-widest text-on-surface/40 mb-1">Pagos</p>
             <p className="text-4xl font-display font-bold text-tertiary">{operations.filter((o: Operation) => o.status === 'ready').length}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="pb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold">Actividad destacada</h2>
          <button className="text-primary text-sm font-bold bg-primary/5 px-4 py-1.5 rounded-full">Recientes</button>
        </div>
        
        <div className="space-y-4">
          {loading ? (
             <div className="py-20 text-center animate-pulse">
                <p className="text-on-surface/40 font-medium">Sincrizando datos...</p>
             </div>
          ) : operations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface/40 bg-surface-container-low rounded-[40px] border-2 border-dashed border-outline-variant/20 shadow-inner">
              <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4 opacity-50">
                 <Plus className="w-8 h-8" />
              </div>
              <p className="font-bold text-lg">Sin operaciones</p>
              <p className="text-sm">Empieza ahora registrando un ingreso</p>
            </div>
          ) : (
            operations.map((op: Operation) => (
              <div 
                key={op.id} 
                onClick={() => setSelectedOp(op)}
                className={`logistics-card flex items-start gap-4 active:scale-95 transition-transform cursor-pointer group hover:bg-surface-container-low ${op.status === 'alert' ? 'ring-2 ring-primary-fixed' : ''}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative shadow-sm transition-colors ${
                  op.status === 'ready' ? 'bg-secondary/10' : 
                  op.status === 'alert' ? 'bg-primary-fixed/20' : 
                  op.status === 'closed' ? 'bg-on-secondary-fixed/10' : 'bg-primary/10'
                }`}>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-surface rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    {op.status === 'ready' ? <CheckCircle2 className="text-secondary w-4 h-4" /> :
                     op.status === 'alert' ? <AlertCircle className="text-primary-fixed w-4 h-4" /> :
                     op.status === 'closed' ? <Check className="text-on-secondary-fixed w-4 h-4" /> :
                     <FileText className="text-primary w-4 h-4" />}
                  </div>
                  <span className={`text-sm font-black ${
                    op.status === 'ready' ? 'text-secondary' : 
                    op.status === 'alert' ? 'text-primary-fixed' : 
                    op.status === 'closed' ? 'text-on-secondary-fixed' : 'text-primary'
                  }`}>
                    {suppliers.find(s => s.id === op.supplierId)?.initials || '??'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors truncate">{op.supplierName}</h3>
                    {op.amount && <span className="text-sm font-black font-display text-on-surface">{op.amount}</span>}
                  </div>
                  <p className="text-sm text-on-surface/50 truncate">{op.type} • {op.date}</p>
                  {op.observations && <p className="text-sm mt-1 text-on-surface font-medium line-clamp-1 italic">"{op.observations}"</p>}
                  {getStatusChip(op.status)}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Glass Bottom Nav */}
      <nav className="fixed bottom-6 left-6 right-6 h-16 glass-nav flex items-center justify-around px-2 rounded-full shadow-2xl z-50 overflow-hidden">
        <button className="flex flex-col items-center justify-center w-20 h-full text-primary">
          <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full mb-0.5">
             <FileText className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Inicio</span>
        </button>
        <button className="flex flex-col items-center justify-center w-20 h-full text-on-surface/30">
          <div className="w-10 h-10 flex items-center justify-center mb-0.5">
             <Clock className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Pagos</span>
        </button>
      </nav>
      
      {/* Floating Action Button */}
      {isAdmin && (
        <button 
          onClick={() => setIsFormOpen(true)}
          className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-[20px] shadow-xl shadow-primary/30 flex items-center justify-center text-white z-50 transition-all hover:scale-110 active:scale-95 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <Plus className="w-9 h-9 relative z-10" />
        </button>
      )}

      {/* Form & Detail Modals */}
      <ReceptionForm 
        isOpen={isFormOpen} 
        suppliers={suppliers}
        onClose={() => setIsFormOpen(false)} 
        onAdd={handleAddOperation}
        onAddSupplier={async (name: string) => {
          const initials = name.substring(0, 2).toUpperCase();
          const { data, error } = await supabase
            .from('suppliers')
            .insert([{ name, initials }])
            .select();
          
          if (!error && data) {
            setSuppliers((prev: Supplier[]) => [...prev, data[0]]);
            return data[0];
          }
          return { id: '', name: '', initials: '' };
        }}
      />

      {selectedOp && (
        <OperationDetail
          operation={selectedOp}
          onClose={() => setSelectedOp(null)}
          onUpdate={handleUpdateOperation}
        />
      )}
    </div>
  );
}

export default App;
 App;
