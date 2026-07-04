import React from 'react';
import { Link } from 'react-router-dom';

export default function AnimeCard({ anime, isHot }) {
    const proxyUrl = (url) => {
        if (!url) return '';
        return `https://api.nexalabs.my.id/proxy_image?url=${encodeURIComponent(url)}`;
    };

    return (
        <div className="group flex flex-col h-full">
            
            {/* Thumbnail */}
            <Link to={`/anime/${anime.id}`} className="w-full aspect-[3/4] relative border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] bg-zinc-200 overflow-hidden flex-shrink-0 rounded-md mb-2 transition-transform duration-300 block">
                <img 
                    src={proxyUrl(anime.image_poster || anime.image_cover)} 
                    alt={anime.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Status Badge */}
                {anime.status && (
                    <div className="absolute top-1.5 left-1.5 z-10">
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase rounded-[4px] ${
                            (anime.status === 'Completed' || anime.status === 'FINISHED') && anime.is_custom ? 'bg-[#ffde00] text-[#1a202c]' :
                            anime.status === 'FINISHED' ? 'bg-[#255ad5] text-white' : 
                            anime.status === 'ONGOING' || anime.status === 'Ongoing' ? 'bg-[#2ecc71] text-white' : 'bg-[#f1c40f] text-[#1a202c]'
                        }`}>
                            {(anime.status === 'Completed' || anime.status === 'FINISHED') && anime.is_custom ? 'FINISHED' : anime.status}
                        </span>
                    </div>
                )}

                {/* Bottom overlay: genre + type */}
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-between">
                    <span className="text-white text-[11px] font-extrabold truncate pr-2 drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                        {anime.genre || 'Action'}
                    </span>
                    {anime.type && (
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase rounded-[4px] flex-shrink-0 ${
                            anime.type === 'SERIES' || anime.type === 'TV' ? 'bg-[#00d4ff] text-[#1a202c]' : 'bg-[#499cf4] text-white'
                        }`}>
                            {anime.type}
                        </span>
                    )}
                </div>
            </Link>

            {/* Info */}
            <div className="flex flex-col flex-grow px-0.5 mt-1">
                <Link to={`/anime/${anime.id}`}>
                    <h3 className="font-sans font-bold text-[13px] leading-tight text-[#1a202c] line-clamp-2 mb-1 hover:text-[#e50914] group-hover:text-[#e50914] transition-colors cursor-pointer">
                        {anime.title}
                    </h3>
                </Link>
                
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold mb-1.5">
                    <span>Likes: <span className="text-[#e50914]">{anime.favorites ? Number(anime.favorites).toLocaleString('en-US') : 0}</span></span>
                    <span className="truncate">{anime.views ? Number(anime.views).toLocaleString('en-US') : 0} Views</span>
                </div>

                {anime.synopsis && (
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 font-medium mb-2">
                        {anime.synopsis}
                    </p>
                )}

                {/* Trailer Button */}
                <div className="mt-auto pt-2">
                    <a 
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(anime.title + ' trailer')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-[#e50914] text-white border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] hover:shadow-[0_0_0_0_#1a202c] hover:translate-y-[3px] hover:translate-x-[3px] rounded-md py-1.5 flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer"
                    >
                        <svg viewBox="0 0 576 512" width="14" height="14" fill="currentColor">
                            <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z" />
                        </svg>
                        <span className="text-[12px] font-extrabold tracking-wide">Cari Trailer</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
