import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { X } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { fetchStatus } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
        setError("Password harus minimal 6 karakter.");
        return;
    }
    
    setLoading(true);
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(`http://103.30.195.243:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, display_name: isLogin ? undefined : displayName }),
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.success) {
        await fetchStatus();
        onClose();
      } else {
        setError(data.message || "Terjadi kesalahan.");
      }
    } catch (err) {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white border-[2px] border-[#1a202c] shadow-[4px_4px_0_0_#1a202c] rounded-md w-full max-w-sm relative">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-[#1a202c] hover:bg-[#ffde00] rounded-sm p-1 transition-colors border-[2px] border-transparent hover:border-[#1a202c] hover:shadow-[2px_2px_0_0_#1a202c]"
        >
          <X size={20} className="stroke-[3px]" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-extrabold text-[#1a202c] font-sans uppercase mb-6 tracking-tight text-center">
            {isLogin ? "Masuk ke NEXA" : "Daftar Akun"}
          </h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-[#ff4757]/10 border-[2px] border-[#ff4757] text-[#ff4757] px-3 py-2 text-sm font-bold rounded-sm shadow-[2px_2px_0_0_#ff4757]">
                {error}
              </div>
            )}
            
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-[#1a202c] uppercase">Nama Profil</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full bg-slate-100 border-[2px] border-[#1a202c] rounded-sm py-2 px-3 text-sm font-bold text-[#1a202c] placeholder:text-slate-400 focus:outline-none focus:bg-[#ffde00] transition-colors shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.05)]"
                  placeholder="NEXA Nime"
                />
              </div>
            )}
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-[#1a202c] uppercase">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-100 border-[2px] border-[#1a202c] rounded-sm py-2 px-3 text-sm font-bold text-[#1a202c] placeholder:text-slate-400 focus:outline-none focus:bg-[#ffde00] transition-colors shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.05)]"
                placeholder="nexa_fan_123"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-[#1a202c] uppercase">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-100 border-[2px] border-[#1a202c] rounded-sm py-2 px-3 text-sm font-bold text-[#1a202c] placeholder:text-slate-400 focus:outline-none focus:bg-[#ffde00] transition-colors shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.05)]"
                placeholder="Min. 6 karakter"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="mt-2 w-full bg-[#1a202c] text-white hover:bg-[#00d4ff] hover:text-[#1a202c] font-extrabold text-sm px-4 py-2.5 border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] hover:-translate-y-1 hover:shadow-[5px_5px_0_0_#1a202c] active:translate-y-0 active:shadow-[0px_0px_0_0_#1a202c] transition-all duration-200 uppercase tracking-wider rounded-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? <LoadingSpinner text="Memproses..." /> : (isLogin ? "Masuk" : "Daftar")}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm font-bold text-slate-500">
            {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-[#00d4ff] hover:text-[#1a202c] underline decoration-2 underline-offset-2 transition-colors"
            >
              {isLogin ? "Daftar di sini" : "Masuk di sini"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
