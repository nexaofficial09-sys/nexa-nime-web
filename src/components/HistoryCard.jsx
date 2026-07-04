import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Trash2, Clock } from 'lucide-react';

export default function HistoryCard({ item, onDelete }) {
  // Format durasi (contoh: 125 -> 02:05)
  const formatTime = (seconds) => {
    if (!seconds) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const proxyUrl = (url) => {
    if (!url) return '';
    return `https://api.nexalabs.my.id/proxy_image?url=${encodeURIComponent(url)}`;
  };

  return (
    <Link 
      to={item.episode_id ? `/stream/${item.episode_id}` : `/anime/${item.anime_id}`} 
      className="group flex flex-row items-start gap-4 p-3 bg-white border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0_0_#ffde00] active:translate-y-0 active:translate-x-0 active:shadow-[0px_0px_0_0_#1a202c] transition-all duration-200 rounded-md cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative w-32 sm:w-40 md:w-48 aspect-video bg-[#1a202c] border-[2px] border-[#1a202c] rounded-sm overflow-hidden shrink-0 flex items-center justify-center">
        <img 
          src={proxyUrl(item.image)} 
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/320x180/1a202c/ffffff?text=No+Image";
          }}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Play className="text-white fill-white w-8 h-8" />
        </div>
        
        {/* Waktu Tonton Badge */}
        {item.time_watched >= 0 && (
          <div className="absolute bottom-1.5 right-1.5 bg-[#1a202c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
            {formatTime(item.time_watched)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col pt-1 min-w-0 pr-2">
        <h3 className="font-extrabold text-[#1a202c] text-sm sm:text-base line-clamp-2 leading-tight group-hover:text-[#5143d9] transition-colors">
          {item.title}
        </h3>
        <div className="flex flex-col mt-2 gap-1.5 items-start">
            {item.episode && (
            <span className="font-sans font-extrabold text-[#1a202c] text-[10px] sm:text-xs uppercase bg-[#ffde00] px-2 py-0.5 rounded-sm border-[2px] border-[#1a202c] shadow-[2px_2px_0_0_#1a202c] tracking-wider">
                Episode {item.episode}
            </span>
            )}
            {item.timestamp && (
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Clock size={12} className="stroke-[3px]" />
                    {formatDate(item.timestamp)}
                </span>
            )}
        </div>
      </div>

      {/* Delete Button */}
      {onDelete && (
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(item.anime_id);
          }}
          className="self-center p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
          title="Hapus dari riwayat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
    </Link>
  );
}
