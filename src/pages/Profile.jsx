import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { LogOut, Star, Trophy, History } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import HistoryCard from '../components/HistoryCard';

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        try {
          const res = await fetch(`https://api.nexalabs.my.id/api/history`, { credentials: 'include' });
          const data = await res.json();
          if (data.success) {
            setHistory(data.history || data.data || []);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [user]);

  const handleDeleteHistory = async (anime_id) => {
    try {
      const res = await fetch(`https://api.nexalabs.my.id/api/history/${anime_id}`, { 
        method: 'DELETE',
        credentials: 'include' 
      });
      const data = await res.json();
      if (data.success) {
        setHistory(prev => prev.filter(h => h.anime_id !== anime_id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllHistory = async () => {
    if (!window.confirm("Yakin ingin menghapus semua riwayat tontonan?")) return;
    try {
      const res = await fetch(`https://api.nexalabs.my.id/api/history/clear`, { 
        method: 'POST',
        credentials: 'include' 
      });
      const data = await res.json();
      if (data.success) {
        setHistory([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 flex justify-center items-center min-h-[50vh]"><LoadingSpinner /></div>;
  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="flex flex-col gap-6 p-2 sm:p-0">
      {/* Profile Card */}
      <div className="bg-white border-[2px] border-[#1a202c] shadow-[4px_4px_0_0_#1a202c] overflow-hidden rounded-md flex flex-col relative">
        {/* Banner/Header */}
        <div className="h-24 sm:h-32 bg-gradient-to-r from-[#5143d9] to-[#00d4ff] border-b-[2px] border-[#1a202c]"></div>
        
        <div className="px-4 sm:px-8 pb-6 sm:pb-8 relative flex flex-col md:flex-row items-center md:items-start justify-between gap-4 sm:gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto">
              <img 
                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.username}&backgroundColor=b6e3f4`}
                alt="Profile Avatar" 
                className="w-24 h-24 sm:w-32 sm:h-32 -mt-12 sm:-mt-16 bg-white border-[3px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] rounded-full object-cover shrink-0"
              />
              <div className="flex-1 text-center md:text-left mt-2 md:mt-4">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a202c] uppercase tracking-tight">{user.display_name || user.username}</h1>
                  <p className="text-slate-500 font-bold text-xs sm:text-sm mb-1">@{user.username}</p>
                  <p className="text-slate-500 font-bold text-xs sm:text-sm mb-3">
                    {user.is_admin ? "Administrator NEXA Nime" : "Anggota NEXA Nime"}
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <span className="flex items-center gap-1.5 bg-[#1a202c] text-white text-[11px] sm:text-xs font-bold px-2.5 py-1.5 uppercase rounded-sm border-[2px] border-[#1a202c] shadow-[2px_2px_0_0_#1a202c]">
                          <Trophy size={14} className="text-[#ffde00]" />
                          Role: {user.role}
                      </span>
                      <span className="flex items-center gap-1.5 bg-[#00d4ff] text-[#1a202c] text-[11px] sm:text-xs font-bold px-2.5 py-1.5 uppercase rounded-sm border-[2px] border-[#1a202c] shadow-[2px_2px_0_0_#1a202c]">
                          <Star size={14} className="fill-[#1a202c]" />
                          Points: {user.points}
                      </span>
                  </div>
              </div>
          </div>
          
          <div className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-6 px-2 md:px-0 flex flex-col gap-3">
              {user.is_admin && (
                <Link 
                    to="/admin"
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#00d4ff] text-[#1a202c] hover:bg-[#1a202c] hover:text-[#00d4ff] font-extrabold text-sm px-6 py-2.5 border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#1a202c] active:translate-y-0 active:shadow-[0px_0px_0_0_#1a202c] transition-all uppercase tracking-wider rounded-sm"
                >
                    DASBOR ADMIN
                </Link>
              )}
              <button 
                  onClick={logout}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#ff4757] text-white hover:bg-[#1a202c] font-extrabold text-sm px-6 py-2.5 border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#1a202c] active:translate-y-0 active:shadow-[0px_0px_0_0_#1a202c] transition-all uppercase tracking-wider rounded-sm"
              >
                  <LogOut size={16} strokeWidth={3} />
                  Keluar
              </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-[2px] border-[#1a202c] shadow-[4px_4px_0_0_#1a202c] p-4 rounded-md">
        <div className="flex items-center justify-between border-b-[3px] border-[#1a202c] pb-2 mb-4">
            <h2 className="text-lg font-extrabold text-[#1a202c] uppercase flex items-center gap-2">
                <History size={20} className="stroke-[3px]" />
                Riwayat Tontonan
            </h2>
            {history.length > 0 && (
                <button 
                    onClick={handleClearAllHistory}
                    className="font-sans text-xs font-extrabold bg-[#ff4757] text-white hover:bg-[#1a202c] px-3 py-1.5 border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#1a202c] active:translate-y-0 active:shadow-[0px_0px_0_0_#1a202c] transition-all uppercase tracking-wider rounded-sm"
                >
                    Hapus Semua
                </button>
            )}
        </div>
        
        {loadingHistory ? (
          <div className="p-8 flex justify-center"><LoadingSpinner /></div>
        ) : history.length === 0 ? (
          <div className="p-6 text-center text-slate-500 font-bold uppercase text-sm">Belum ada riwayat tontonan.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((item, idx) => (
              <HistoryCard key={idx} item={item} onDelete={handleDeleteHistory} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
