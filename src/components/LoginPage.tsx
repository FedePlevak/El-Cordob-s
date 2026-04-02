import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, Mail, Lock, ShieldCheck, UserPlus } from 'lucide-react';

export function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (isRegistering) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg("Registro exitoso. Tu cuenta debe ser aprobada por el administrador.");
        // Opcionalmente podemos cambiar al modo de login
        setTimeout(() => setIsRegistering(false), 3000);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-surface to-surface">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20 rotate-3 transform transition-transform hover:rotate-0">
                <ShieldCheck className="w-9 h-9 text-white" />
            </div>
          <h1 className="text-3xl font-display font-bold text-on-surface">El Cordobés</h1>
          <p className="text-on-surface/50 mt-2">Control de factuación v.0.1</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="form-label px-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface/30" />
              <input 
                type="email" 
                className="form-input pl-11" 
                placeholder="Ejemplo: admin@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="form-label px-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface/30" />
              <input 
                type="password" 
                className="form-input pl-11" 
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-primary-fixed/10 border border-primary-fixed/20 rounded-xl text-primary-fixed text-xs font-semibold text-center mt-2">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs font-semibold text-center mt-2">
              {successMsg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full mt-4 gap-2 h-[60px]"
          >
            {isRegistering ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            {loading ? 'Procesando...' : (isRegistering ? 'Solicitar Acceso' : 'Ingresar')}
          </button>
        </form>

        <div className="text-center mt-4">
          <button 
            onClick={() => { setIsRegistering(!isRegistering); setError(null); setSuccessMsg(null); }}
            className="text-primary hover:underline text-sm font-semibold"
          >
            {isRegistering ? 'Ya tengo una cuenta, iniciar sesión' : 'Solicitar una nueva cuenta'}
          </button>
        </div>

        <p className="text-center text-xs text-on-surface/30 font-medium mt-8">
          Sistema de uso interno únicamente
        </p>
      </div>
    </div>
  );
}
