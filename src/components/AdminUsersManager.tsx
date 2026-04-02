import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldAlert, CheckCircle2, XCircle, Search, User, ShieldCheck } from 'lucide-react';

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export function AdminUsersManager({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    // Asumimos que el super_admin puede leer la tabla profiles
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error("Error fetching users:", error);
    } else if (data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', id);
    if (error) {
      alert(`Error al actualizar estado: ${error.message}`);
      return;
    }
    setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar a este usuario de la base? (No podrá acceder)')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      alert(`Error al eliminar: ${error.message}`);
      return;
    }
    setUsers(users.filter(u => u.id !== id));
  };

  if (!isOpen) return null;

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-scrim/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-2xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low rounded-t-[2rem]">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
               <ShieldCheck className="w-6 h-6" />
             </div>
             <div>
               <h2 className="text-xl font-display font-bold text-on-surface">Gestión de Accesos</h2>
               <p className="text-sm text-on-surface/50">Aprobar o rechazar usuarios</p>
             </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface hover:scale-110 transition-transform">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b border-outline-variant/20">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface/40" />
            <input 
              type="text" 
              placeholder="Buscar por email..."
              className="form-input pl-12 rounded-2xl bg-surface border-outline-variant/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-3 flex-1 min-h-[300px]">
          {loading ? (
             <div className="py-12 text-center animate-pulse">
                <p className="text-on-surface/40 font-medium">Cargando usuarios...</p>
             </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-on-surface/40 flex flex-col items-center">
              <ShieldAlert className="w-12 h-12 mb-3 opacity-20" />
              <p>No hay usuarios registrados</p>
            </div>
          ) : (
            filteredUsers.map(user => (
              <div key={user.id} className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-3 items-center">
                   <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                     <User className="w-5 h-5" />
                   </div>
                   <div>
                     <p className="font-bold text-on-surface truncate pr-2 max-w-[200px]">{user.email}</p>
                     <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container-highest text-on-surface">{user.role}</span>
                        {user.status === 'pending' && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-tertiary/20 text-tertiary">Pendiente</span>}
                        {user.status === 'approved' && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary">Aprobado</span>}
                        {user.status === 'rejected' && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-error/20 text-error">Rechazado</span>}
                     </div>
                   </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  {user.status !== 'approved' && (
                    <button 
                      onClick={() => handleUpdateStatus(user.id, 'approved')}
                      className="flex-1 sm:flex-none px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Aprobar
                    </button>
                  )}
                  {user.status !== 'rejected' && (
                    <button 
                      onClick={() => handleUpdateStatus(user.id, 'rejected')}
                      className="flex-1 sm:flex-none px-4 py-2 bg-error-container text-on-error-container rounded-xl text-sm font-semibold hover:bg-error-container/80 transition-colors"
                    >
                      Rechazar
                    </button>
                  )}
                  {user.status === 'rejected' && (
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="flex-1 sm:flex-none px-4 py-2 border border-error text-error rounded-xl text-sm font-semibold hover:bg-error/10 transition-colors"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
