import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCircle2, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationDropdown({ mobileMode = false }) {
  const { notifications, unreadCount, markAsRead, fetchNotifications } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkRead = (id, e) => {
    e.stopPropagation();
    markAsRead(id);
  };

  return (
    <div className={mobileMode ? "flex flex-col items-center justify-center w-14 gap-0.5 text-[#1a202c] transition-colors relative" : "relative"} ref={dropdownRef}>
      {mobileMode ? (
        <button onClick={handleToggle} className="flex flex-col items-center justify-center relative w-full">
            <Bell size={22} strokeWidth={2.5} />
            <span className="text-[9px] font-extrabold tracking-tight uppercase">Notif</span>
            {unreadCount > 0 && (
                <span className="absolute -top-1 right-1 bg-[#ff4757] text-white text-[9px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full border-[2px] border-[#1a202c]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
      ) : (
        <button 
          onClick={handleToggle}
          className="relative group bg-white border-[2px] border-[#1a202c] shadow-[2px_2px_0_0_#1a202c] hover:shadow-[3px_3px_0_0_#1a202c] hover:-translate-y-[2px] active:translate-y-0 active:shadow-[0px_0px_0_0_#1a202c] transition-all duration-150 p-1.5 sm:p-2 rounded-md"
        >
          <Bell size={18} className="text-[#1a202c] group-hover:text-[#00d4ff] transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#ff4757] text-white text-[9px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full border-[2px] border-[#1a202c]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div className={`absolute ${mobileMode ? 'bottom-full mb-4 right-[-60px]' : 'right-0 mt-2'} w-72 sm:w-80 bg-white border-[2px] border-[#1a202c] shadow-[4px_4px_0_0_#1a202c] rounded-md z-[60] flex flex-col overflow-hidden`}>
          <div className="px-4 py-3 border-b-[2px] border-[#1a202c] bg-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-[#1a202c] text-sm uppercase tracking-tight">Notifikasi</h3>
            <button onClick={() => fetchNotifications()} className="text-[10px] text-slate-500 hover:text-[#1a202c] font-bold uppercase underline">Refresh</button>
          </div>
          
          <div className="max-h-80 overflow-y-auto bg-[#f8fafc] p-2 space-y-2" style={{ scrollbarWidth: 'thin' }}>
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 font-bold text-xs uppercase border-[2px] border-dashed border-[#1a202c] rounded-md m-2 bg-white">
                Belum ada notifikasi
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-3 border-[2px] border-[#1a202c] rounded-md flex gap-3 transition-transform duration-200 ${notif.is_read ? 'bg-white opacity-80' : 'bg-[#fff5e6] shadow-[3px_3px_0_0_#1a202c] -translate-y-[1px]'}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {notif.type === 'warning' ? <AlertTriangle size={18} className="text-[#f39c12]" /> :
                     notif.type === 'success' ? <ShieldCheck size={18} className="text-[#2ecc71]" /> :
                     <Info size={18} className="text-[#3498db]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-[#1a202c] text-[13px] uppercase mb-1 leading-tight">{notif.title}</h4>
                    <p className="text-[#1a202c] text-xs font-semibold leading-relaxed mb-2 opacity-90">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-600 font-bold bg-slate-200 px-2 py-0.5 rounded-sm border-[1px] border-[#1a202c]">
                      {new Date(notif.timestamp).toLocaleString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                    </span>
                  </div>
                  {!notif.is_read && (
                    <button 
                      onClick={(e) => handleMarkRead(notif.id, e)}
                      title="Tandai sudah dibaca"
                      className="text-[#1a202c] hover:text-[#2ecc71] flex-shrink-0 self-start transition-colors bg-white border-[2px] border-[#1a202c] rounded-full p-0.5"
                    >
                      <CheckCircle2 size={16} strokeWidth={3} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="px-4 py-3 border-t-[2px] border-[#1a202c] bg-white text-center hover:bg-slate-50 transition-colors">
             <Link to="/notifications" onClick={() => setIsOpen(false)} className="text-[11px] font-black text-[#1a202c] hover:text-[#00d4ff] uppercase tracking-wider flex items-center justify-center gap-1">
                LIHAT SEMUA NOTIFIKASI <span className="text-[14px]">→</span>
             </Link>
          </div>
        </div>
      )}
    </div>
  );
}
