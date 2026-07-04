import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Info, AlertTriangle, ShieldCheck, Bell } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Notifications() {
  const { notifications, loading, markAsRead, unreadCount } = useAuth();

  if (loading) return <div className="p-8 flex justify-center items-center min-h-[50vh]"><LoadingSpinner /></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-0 flex flex-col gap-6">
      
      {/* Header Banner */}
      <div className="bg-[#00d4ff] border-[3px] border-[#1a202c] shadow-[6px_6px_0_0_#1a202c] rounded-md p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
          <Bell size={120} className="text-[#1a202c] transform rotate-12" strokeWidth={1} />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a202c] uppercase tracking-tight">Semua Notifikasi</h1>
            <p className="text-[#1a202c] font-bold text-sm mt-1 opacity-80">
              Tetap terhubung dengan kabar terbaru dari NEXA Nime.
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="bg-[#ff4757] text-white px-4 py-2 border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] font-black uppercase text-sm rounded-md self-start sm:self-center">
              {unreadCount} Pesan Baru
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white border-[3px] border-[#1a202c] shadow-[6px_6px_0_0_#1a202c] rounded-md p-4 sm:p-8 min-h-[50vh]">
        
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-[3px] border-dashed border-[#1a202c] rounded-md bg-[#f8fafc]">
            <Bell size={48} className="text-slate-300 mb-4" />
            <h2 className="text-xl font-extrabold text-[#1a202c] uppercase mb-2">Belum Ada Notifikasi</h2>
            <p className="text-slate-500 font-bold max-w-sm">Saat ini tidak ada pengumuman atau notifikasi baru untuk Anda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`relative flex flex-col sm:flex-row gap-4 p-5 sm:p-6 border-[3px] border-[#1a202c] rounded-md transition-transform duration-200 ${
                  notif.is_read 
                    ? 'bg-white opacity-80' 
                    : 'bg-[#fff5e6] shadow-[4px_4px_0_0_#1a202c] -translate-y-[2px]'
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-md flex items-center justify-center border-[2px] border-[#1a202c] ${
                    notif.type === 'warning' ? 'bg-[#f1c40f]' :
                    notif.type === 'success' ? 'bg-[#2ecc71]' :
                    'bg-[#00d4ff]'
                  }`}>
                    {notif.type === 'warning' ? <AlertTriangle size={24} className="text-[#1a202c]" strokeWidth={2.5} /> :
                     notif.type === 'success' ? <ShieldCheck size={24} className="text-[#1a202c]" strokeWidth={2.5} /> :
                     <Info size={24} className="text-[#1a202c]" strokeWidth={2.5} />}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="font-black text-[#1a202c] text-lg uppercase tracking-tight">{notif.title}</h3>
                    {!notif.is_read && (
                      <span className="bg-[#ff4757] text-white text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider border-[1px] border-[#1a202c]">
                        Baru
                      </span>
                    )}
                  </div>
                  <p className="text-[#1a202c] font-medium leading-relaxed mb-4 whitespace-pre-wrap">
                    {notif.message}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1 rounded-sm border-[2px] border-[#1a202c]">
                      {new Date(notif.timestamp).toLocaleString('id-ID', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {!notif.is_read && (
                  <div className="absolute top-4 right-4 sm:static sm:flex sm:items-center sm:justify-center">
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="bg-white hover:bg-[#2ecc71] text-[#1a202c] hover:text-white p-2 rounded-full border-[2px] border-[#1a202c] shadow-[2px_2px_0_0_#1a202c] hover:shadow-[0_0_0_0_#1a202c] hover:translate-y-[2px] transition-all"
                      title="Tandai sudah dibaca"
                    >
                      <CheckCircle2 size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
